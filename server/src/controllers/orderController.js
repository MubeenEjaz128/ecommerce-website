const crypto = require("crypto");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "");
const { prisma } = require("../config/db");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const PDFDocument = require("pdfkit");

function buildTimeline(status, note) {
  return [
    { status: "pending", note: "Order placed", at: new Date() }, 
    { status, note, at: new Date() }
  ];
}

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, billingAddress, paymentMethod = "stripe", coupon = null } = req.body;
  const cart = await prisma.cart.findUnique({ 
    where: { userId: req.user.id },
    include: { items: { include: { product: true, variant: true } } } 
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 150 ? 0 : 12;
  const taxFee = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + shippingFee + taxFee).toFixed(2));
  const orderNumber = `FH-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  const orderData = {
    userId: req.user.id,
    orderNumber,
    paymentMethod,
    subtotal,
    shippingFee,
    taxFee,
    totalAmount,
    status: paymentMethod === "cod" ? "confirmed" : "pending",
    trackingSteps: {
      create: buildTimeline(paymentMethod === "cod" ? "confirmed" : "pending", paymentMethod === "cod" ? "Cash on delivery selected" : "Awaiting payment confirmation")
    },
    items: {
      create: cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        sku: item.variant?.sku || item.product.slug,
        quantity: item.quantity,
        price: item.price,
      }))
    }
  };

  if (coupon) {
    const cp = await prisma.coupon.findUnique({ where: { id: coupon } });
    if (cp) {
      orderData.couponId = cp.id;
    }
  }

  if (shippingAddress) {
    orderData.shippingAddress = { create: shippingAddress };
  }
  if (billingAddress) {
    orderData.billingAddress = { create: billingAddress || shippingAddress };
  }

  const order = await prisma.order.create({ data: orderData });

  if (req.body.paymentIntentId && process.env.STRIPE_SECRET_KEY) {
    try {
      const pi = await stripe.paymentIntents.retrieve(req.body.paymentIntentId);
      const paymentData = {
        orderId: order.id,
        userId: req.user.id,
        provider: "stripe",
        stripePaymentIntentId: pi.id,
        transactionId: pi.charges && pi.charges.data && pi.charges.data[0] ? pi.charges.data[0].id : "",
        amount: (pi.amount_received || pi.amount || 0) / 100,
        currency: pi.currency || "usd",
        status: pi.status === "succeeded" ? "succeeded" : "pending",
        rawPayload: pi,
      };

      await prisma.payment.create({ data: paymentData });

      if (pi.status === "succeeded") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "confirmed",
            trackingSteps: {
              create: { status: "paid", note: "Payment received via Stripe" }
            }
          }
        });
      }
    } catch (err) {
      console.error("Error attaching payment to order:", err);
    }
  }

  // Clear cart
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.update({
    where: { id: cart.id },
    data: { subtotal: 0, shippingFee: 0, taxFee: 0, total: 0 }
  });

  const populatedOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      user: true,
      items: { include: { product: true, variant: true } },
      coupon: true,
      shippingAddress: true,
      billingAddress: true,
      trackingSteps: true
    }
  });

  return res.status(201).json(new ApiResponse(201, "Order created", populatedOrder));
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: true, variant: true } },
      coupon: true,
      trackingSteps: true
    }
  });
  return res.status(200).json(new ApiResponse(200, "Orders fetched", orders));
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      user: true,
      items: { include: { product: true, variant: true } },
      coupon: true,
      trackingSteps: true,
      shippingAddress: true,
      billingAddress: true
    }
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res.status(200).json(new ApiResponse(200, "Order fetched", order));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
      trackingSteps: {
        create: { status: "cancelled", note: "Order cancelled by customer" }
      }
    }
  });

  return res.status(200).json(new ApiResponse(200, "Order cancelled", updatedOrder));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { status, user, q, page = 1, limit = 20, sort = "-createdAt" } = req.query;
  const where = {};
  if (status) where.status = status;
  if (user) where.userId = user;
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } }
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const perPage = Math.max(1, Math.min(100, Number(limit)));

  const orderBy = {};
  if (sort.startsWith('-')) {
    orderBy[sort.substring(1)] = "desc";
  } else {
    orderBy[sort] = "asc";
  }

  const total = await prisma.order.count({ where });
  const orders = await prisma.order.findMany({
    where,
    orderBy,
    skip: (pageNum - 1) * perPage,
    take: perPage,
    include: {
      items: { include: { product: true, variant: true } },
      user: true
    }
  });

  return res.status(200).json(new ApiResponse(200, "Orders fetched", { items: orders, total, page: pageNum, perPage }));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded", "returned"];
  if (!status || !allowed.includes(status)) throw new ApiError(400, "Invalid status");

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) throw new ApiError(404, "Order not found");

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status,
      trackingSteps: {
        create: { status, note: note || `Status changed to ${status}` }
      }
    }
  });

  return res.status(200).json(new ApiResponse(200, "Order status updated", updatedOrder));
});

const refundOrder = asyncHandler(async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) throw new ApiError(500, "Stripe not configured");

  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { user: true } });
  if (!order) throw new ApiError(404, "Order not found");

  const payment = await prisma.payment.findFirst({ where: { orderId: order.id } });
  if (!payment || payment.provider !== "stripe" || !payment.stripePaymentIntentId) {
    throw new ApiError(400, "No stripe payment found for this order");
  }

  try {
    const pi = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId, { expand: ["charges.data.balance_transaction"] });
    const chargeId = pi.charges && pi.charges.data && pi.charges.data[0] ? pi.charges.data[0].id : null;
    const refundParams = { payment_intent: payment.stripePaymentIntentId };
    if (chargeId) refundParams.charge = chargeId;

    const refund = await stripe.refunds.create(refundParams);

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "refunded" }
    });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "refunded",
        trackingSteps: {
          create: { status: "refunded", note: `Refund processed (id: ${refund.id})` }
        }
      }
    });

    return res.status(200).json(new ApiResponse(200, "Order refunded", { refund, order: updatedOrder }));
  } catch (err) {
    console.error("Refund failed", err);
    throw new ApiError(500, "Refund failed");
  }
});

const getInvoice = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({ 
    where: { id: req.params.id }, 
    include: {
      items: { include: { product: true, variant: true } },
      user: true,
      coupon: true
    }
  });

  if (!order) throw new ApiError(404, "Order not found");

  if (order.userId !== req.user.id && req.user.role !== "admin") {
    throw new ApiError(403, "Not allowed");
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.orderNumber}.pdf`);

  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Order: ${order.orderNumber}`);
  doc.text(`Date: ${order.createdAt.toISOString()}`);
  doc.text(`Customer: ${order.user.name || order.user.email}`);
  doc.moveDown();

  order.items.forEach((item) => {
    doc.text(`${item.quantity} x ${item.name} — ${item.price.toFixed(2)} each = ${(item.price * item.quantity).toFixed(2)}`);
  });

  doc.moveDown();
  doc.text(`Subtotal: ${order.subtotal.toFixed(2)}`);
  doc.text(`Shipping: ${order.shippingFee.toFixed(2)}`);
  doc.text(`Tax: ${order.taxFee.toFixed(2)}`);
  doc.text(`Total: ${order.totalAmount ? order.totalAmount.toFixed(2) : order.subtotal.toFixed(2)}`);

  doc.end();
  doc.pipe(res);
});

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder, getInvoice, getAllOrders, updateOrderStatus, refundOrder };