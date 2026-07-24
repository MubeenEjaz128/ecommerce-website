const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, unique: true },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", default: null },
    quantity: { type: Number, default: 0, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Inventory", inventorySchema);