const mongoose = require("mongoose");

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    status: { type: String, enum: ["active", "unsubscribed"], default: "active" },
    source: { type: String, default: "website" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);