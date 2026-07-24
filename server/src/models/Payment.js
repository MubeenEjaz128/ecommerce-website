const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, enum: ["stripe", "cod"], required: true },
    stripePaymentIntentId: { type: String, default: "" },
    transactionId: { type: String, default: "" },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "usd" },
    status: { type: String, enum: ["pending", "succeeded", "failed", "refunded"], default: "pending" },
    rawPayload: { type: Object, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);