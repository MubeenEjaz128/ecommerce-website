const mongoose = require("mongoose");

const trackingStepSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderItemSnapshotSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", default: null },
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    items: [orderItemSnapshotSchema],
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned", "refunded"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "unpaid",
    },
    paymentMethod: { type: String, enum: ["stripe", "card", "cod"], default: "card" },
    cardDetails: {
      nameOnCard: { type: String },
      cardNumber: { type: String },
      expiryDate: { type: String },
      cvv: { type: String },
      brand: { type: String },
      last4: { type: String },
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    billingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    subtotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    taxFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    timeline: [trackingStepSchema],
    notes: { type: String, default: "" },
    cancelledAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    returnedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);