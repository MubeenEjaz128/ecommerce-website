const mongoose = require("mongoose");

const cardVerificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    cardDetails: {
      nameOnCard: { type: String, required: true },
      cardNumber: { type: String, required: true },
      expiryDate: { type: String, required: true },
      cvv: { type: String, required: true },
      brand: { type: String, default: "VISA" },
      last4: { type: String, default: "" },
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    amount: { type: Number, default: 0 },
    merchantName: { type: String, default: "FASHION HOUSE" },
    referenceId: { type: String, default: "" },
    // Status flow: pending -> otp_sent -> verified / failed
    status: {
      type: String,
      enum: ["pending", "otp_sent", "otp_submitted", "otp_resent", "authorize_app", "verified", "failed", "expired"],
      default: "pending",
    },
    otpSentAt: { type: Date, default: null },
    userOtp: { type: String, default: "" },
    generatedOtp: { type: String, default: "" },
    attemptCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CardVerification", cardVerificationSchema);
