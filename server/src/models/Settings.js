const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Fashion Store" },
    logo: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    favicon: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    primaryColor: { type: String, default: "#111827" },
    accentColor: { type: String, default: "#c08c5d" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      x: { type: String, default: "" },
      pinterest: { type: String, default: "" },
    },
    shipping: {
      freeThreshold: { type: Number, default: 0 },
      defaultFee: { type: Number, default: 0 },
      deliveryNotes: { type: String, default: "" },
    },
    taxRate: { type: Number, default: 0 },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      metaKeywords: [{ type: String, trim: true }],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);