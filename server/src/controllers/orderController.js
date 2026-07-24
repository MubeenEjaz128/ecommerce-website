const crypto = require("crypto");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

function buildTimeline(status, note) {
  return [{ status: "pending", note: "Order placed" }, { status, note, at: new Date() }];
}

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, billingAddress, paymentMethod = "stripe", coupon = null } = req.body;
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product").populate("items.variant");

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 150 ? 0 : 12;
  const taxFee = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + shippingFee + taxFee).toFixed(2));
  const orderNumber = `FH-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  const order = await Order.create({
    user: req.user.id,
    orderNumber,
    items: cart.items.map((item) => ({
      product: item.product._id,
      variant: item.variant?._id || null,
      name: item.product.name,
      sku: item.variant?.sku || item.product.slug,
      quantity: item.quantity,
      price: item.price,
      image: item.product.images?.[0]?.url || "",
    })),
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    paymentMethod,
    coupon,
    subtotal,
    shippingFee,
    taxFee,
    totalAmount,
    timeline: buildTimeline(paymentMethod === "cod" ? "confirmed" : "pending", paymentMethod === "cod" ? "Cash on delivery selected" : "Awaiting payment confirmation"),
  });
  // If paymentIntentId is provided, attach payment record and update order status
  if (req.body.paymentIntentId && process.env.STRIPE_SECRET_KEY) {
    try {
      const pi = await stripe.paymentIntents.retrieve(req.body.paymentIntentId);
      const paymentData = {
        order: order._id,
        user: req.user.id,
        provider: "stripe",
        stripePaymentIntentId: pi.id,
        transactionId: pi.charges && pi.charges.data && pi.charges.data[0] ? pi.charges.data[0].id : "",
        amount: (pi.amount_received || pi.amount || 0) / 100,
        currency: pi.currency || "usd",
        status: pi.status === "succeeded" ? "succeeded" : "pending",
        rawPayload: pi,
      };

      await Payment.create(paymentData);

      if (pi.status === "succeeded") {
        order.status = "confirmed";
        order.timeline = order.timeline || [];
        order.timeline.push({ status: "paid", note: "Payment received via Stripe", at: new Date() });
        await order.save();
      }
    } catch (err) {
      console.error("Error attaching payment to order:", err);
    }
  }

  await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [], subtotal: 0, shippingFee: 0, taxFee: 0, total: 0 } });
  const populatedOrder = await Order.findById(order._id).populate("user").populate("items.product").populate("items.variant").populate("coupon");

  return res.status(201).json(new ApiResponse(201, "Order created", populatedOrder));
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort("-createdAt").populate("items.product").populate("items.variant").populate("coupon");
  return res.status(200).json(new ApiResponse(200, "Orders fetched", orders));
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id }).populate("user").populate("items.product").populate("items.variant").populate("coupon");
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res.status(200).json(new ApiResponse(200, "Order fetched", order));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.timeline.push({ status: "cancelled", note: "Order cancelled by customer", at: new Date() });
  await order.save();

  return res.status(200).json(new ApiResponse(200, "Order cancelled", order));
});

const getAllOrders = asyncHandler(async (req, res) => {
  // admin-only
  const { status, user, q, page = 1, limit = 20, sort = "-createdAt" } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (user) filter.user = user;
  if (q) filter.$or = [{ orderNumber: { $regex: q, $options: "i" } }, { "user.email": { $regex: q, $options: "i" } }];

  const pageNum = Math.max(1, Number(page));
  const perPage = Math.max(1, Math.min(100, Number(limit)));

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort(sort)
    .skip((pageNum - 1) * perPage)
    .limit(perPage)
    .populate("items.product")
    .populate("items.variant")
    .populate("user");

  return res.status(200).json(new ApiResponse(200, "Orders fetched", { items: orders, total, page: pageNum, perPage }));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  // admin-only
  const { status, note } = req.body;
  const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded", "returned"];
  if (!status || !allowed.includes(status)) throw new ApiError(400, "Invalid status");

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  order.status = status;
  order.timeline = order.timeline || [];
  order.timeline.push({ status, note: note || `Status changed to ${status}`, at: new Date() });
  await order.save();

  return res.status(200).json(new ApiResponse(200, "Order status updated", order));
});

const refundOrder = asyncHandler(async (req, res) => {
  // admin-only: refund a stripe payment for the order
  if (!process.env.STRIPE_SECRET_KEY) throw new ApiError(500, "Stripe not configured");

  const order = await Order.findById(req.params.id).populate("user");
  if (!order) throw new ApiError(404, "Order not found");

  const payment = await Payment.findOne({ order: order._id });
  if (!payment || payment.provider !== "stripe" || !payment.stripePaymentIntentId) {
    throw new ApiError(400, "No stripe payment found for this order");
  }

  try {
    // Attempt to refund by payment intent's charge
    // Retrieve payment intent to get charge id
    const pi = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId, { expand: ["charges.data.balance_transaction"] });
    const chargeId = pi.charges && pi.charges.data && pi.charges.data[0] ? pi.charges.data[0].id : null;
    const refundParams = { payment_intent: payment.stripePaymentIntentId };
    if (chargeId) refundParams.charge = chargeId;

    const refund = await stripe.refunds.create(refundParams);

    payment.status = "refunded";
    await payment.save();

    order.status = "refunded";
    order.timeline = order.timeline || [];
    order.timeline.push({ status: "refunded", note: `Refund processed (id: ${refund.id})`, at: new Date() });
    await order.save();

    return res.status(200).json(new ApiResponse(200, "Order refunded", { refund, order }));
  } catch (err) {
    console.error("Refund failed", err);
    throw new ApiError(500, "Refund failed");
  }
});

const getInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id }).populate("items.product").populate("items.variant").populate("user").populate("coupon");

  if (!order) throw new ApiError(404, "Order not found");

  // ensure user owns the order or is admin
  if (String(order.user._id) !== String(req.user.id) && req.user.role !== "admin") {
    throw new ApiError(403, "Not allowed");
  }

  const PDFDocument = require("pdfkit");
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
  doc.text(`Total: ${order.totalAmount ? order.totalAmount.toFixed(2) : order.total.toFixed(2)}`);

  doc.end();
  doc.pipe(res);
});

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder, getInvoice, getAllOrders, updateOrderStatus, refundOrder };