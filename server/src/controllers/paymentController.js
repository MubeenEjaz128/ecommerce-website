const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "");
const { prisma } = require("../config/db");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const createPaymentIntent = asyncHandler(async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true, variant: true } } }
  });
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Cart is empty");

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 150 ? 0 : 12;
  const taxFee = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + shippingFee + taxFee).toFixed(2));

  const amountInCents = Math.round(totalAmount * 100);

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json(new ApiResponse(500, "Stripe not configured"));
  }

  const metadata = { userId };
  if (req.body.orderId) metadata.orderId = req.body.orderId;

  const intent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: req.body.currency || "usd",
    metadata,
    automatic_payment_methods: { enabled: true },
  });

  return res.status(200).json(new ApiResponse(200, "Payment intent created", { clientSecret: intent.client_secret, id: intent.id }));
});

const webhookHandler = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) return res.status(400).send("Webhook not configured");

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const metadata = pi.metadata || {};
    try {
      let order = null;
      if (metadata.orderId) {
        order = await prisma.order.findUnique({ where: { id: metadata.orderId } });
      }

      if (order) {
        const paymentData = {
          orderId: order.id,
          userId: metadata.userId || order.userId,
          provider: "stripe",
          stripePaymentIntentId: pi.id,
          transactionId: pi.charges && pi.charges.data && pi.charges.data[0] ? pi.charges.data[0].id : "",
          amount: (pi.amount_received || pi.amount) / 100,
          currency: pi.currency,
          status: "succeeded",
          rawPayload: pi,
        };

        await prisma.payment.create({ data: paymentData });
        
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
      console.error("Error processing stripe webhook:", err);
    }
  }

  return res.status(200).json({ received: true });
});

const createCheckoutSession = asyncHandler(async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json(new ApiResponse(500, "Stripe not configured"));

  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json(new ApiResponse(401, "Unauthorized"));

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } }
  });
  if (!cart || cart.items.length === 0) return res.status(400).json(new ApiResponse(400, "Cart empty"));

  const line_items = cart.items.map((it) => ({
    price_data: {
      currency: "usd",
      product_data: { name: it.product.name, metadata: { productId: String(it.productId) } },
      unit_amount: Math.round(it.price * 100),
    },
    quantity: it.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/checkout/cancel`,
    metadata: { userId },
  });

  return res.status(200).json(new ApiResponse(200, "Checkout session created", { id: session.id, url: session.url }));
});

const getSession = asyncHandler(async (req, res) => {
  const sessionId = req.query.sessionId || req.query.session_id || req.body.sessionId;
  if (!sessionId) return res.status(400).json(new ApiResponse(400, "sessionId required"));
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
  return res.status(200).json(new ApiResponse(200, "Session retrieved", session));
});

module.exports = { createPaymentIntent, webhookHandler, createCheckoutSession, getSession };
