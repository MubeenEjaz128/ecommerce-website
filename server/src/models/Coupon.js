const mongoose = require("mongoose");
const slugify = require("slugify");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    slug: { type: String, unique: true, index: true },
    discountType: { type: String, enum: ["percent", "fixed"], default: "percent" },
    value: { type: Number, required: true, min: 0 },
    minSpend: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 },
    usageLimit: { type: Number, default: 0, min: 0 },
    timesUsed: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

couponSchema.pre("save", function setSlug(next) {
  if (this.isModified("code") || !this.slug) {
    this.slug = slugify(this.code, { lower: true, strict: true });
  }

  next();
});

module.exports = mongoose.model("Coupon", couponSchema);