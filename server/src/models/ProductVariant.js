const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    size: { type: String, trim: true, default: "" },
    color: { type: String, trim: true, default: "" },
    sku: { type: String, trim: true, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ProductVariant", productVariantSchema);