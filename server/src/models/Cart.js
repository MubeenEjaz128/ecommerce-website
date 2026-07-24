const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", default: null },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
    saveForLater: { type: Boolean, default: false },
  },
  { _id: true },
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    shippingFee: { type: Number, default: 0 },
    taxFee: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cart", cartSchema);