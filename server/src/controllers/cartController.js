const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

function calculateTotals(items, shippingFee = 0, taxRate = 0.08) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxFee = Number((subtotal * taxRate).toFixed(2));
  const total = Number((subtotal + shippingFee + taxFee).toFixed(2));
  return { subtotal: Number(subtotal.toFixed(2)), taxFee, total };
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId })
    .populate("user")
    .populate("items.product")
    .populate("items.variant");

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id).populate("user").populate("items.product").populate("items.variant");
  }

  return cart;
}

function normalizeCart(cart) {
  const totals = calculateTotals(cart.items, cart.shippingFee || 0);
  cart.subtotal = totals.subtotal;
  cart.taxFee = totals.taxFee;
  cart.total = totals.total;
  return cart;
}

const getCart = asyncHandler(async (req, res) => {
  const cart = normalizeCart(await getOrCreateCart(req.user.id));
  return res.status(200).json(new ApiResponse(200, "Cart fetched", cart));
});

const ProductVariant = require("../models/ProductVariant");

const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variantId = null, saveForLater = false } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const cart = await Cart.findOne({ user: req.user.id });
  const currentCart = cart || (await Cart.create({ user: req.user.id, items: [] }));
  const existingItemIndex = currentCart.items.findIndex(
    (item) => item.product.toString() === productId && String(item.variant || "") === String(variantId || ""),
  );

  // Prefer variant price if a variant is specified
  let itemPrice = product.effectivePrice || product.price;
  let resolvedVariantId = null;
  if (variantId) {
    // try to find variant in product embedded variants
    const embedded = (product.variants || []).find((v) => String(v._id) === String(variantId));
    if (embedded) {
      itemPrice = typeof embedded.price !== "undefined" ? embedded.price : itemPrice;
      resolvedVariantId = embedded._id;
    } else {
      // fallback to ProductVariant collection
      const pv = await ProductVariant.findById(variantId);
      if (pv) {
        itemPrice = typeof pv.price !== "undefined" ? pv.price : itemPrice;
        resolvedVariantId = pv._id;
      }
    }
  }
  if (existingItemIndex >= 0) {
    currentCart.items[existingItemIndex].quantity += Number(quantity);
    currentCart.items[existingItemIndex].saveForLater = saveForLater;
  } else {
    currentCart.items.push({
      product: product._id,
      variant: resolvedVariantId || variantId || null,
      quantity: Number(quantity),
      price: itemPrice,
      saveForLater,
    });
  }

  await currentCart.save();
  const populatedCart = await Cart.findById(currentCart._id).populate("items.product").populate("items.variant").populate("user");
  return res.status(200).json(new ApiResponse(200, "Item added to cart", normalizeCart(populatedCart)));
});

const updateItem = asyncHandler(async (req, res) => {
  const { quantity, saveForLater } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }

  if (typeof quantity !== "undefined") {
    item.quantity = Math.max(1, Number(quantity));
  }

  if (typeof saveForLater !== "undefined") {
    item.saveForLater = Boolean(saveForLater);
  }

  await cart.save();
  const populatedCart = await Cart.findById(cart._id).populate("items.product").populate("items.variant").populate("user");
  return res.status(200).json(new ApiResponse(200, "Cart item updated", normalizeCart(populatedCart)));
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items.id(req.params.itemId)?.deleteOne();
  await cart.save();
  const populatedCart = await Cart.findById(cart._id).populate("items.product").populate("items.variant").populate("user");
  return res.status(200).json(new ApiResponse(200, "Cart item removed", normalizeCart(populatedCart)));
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [] } }, { new: true }).populate("items.product").populate("items.variant").populate("user");
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  return res.status(200).json(new ApiResponse(200, "Cart cleared", normalizeCart(cart)));
});

const applyCoupon = asyncHandler(async (req, res) => {
  const couponCode = String(req.body.code || "").trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: couponCode, active: true });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.coupon = coupon._id;
  await cart.save();

  const populatedCart = await Cart.findById(cart._id)
    .populate("items.product")
    .populate("items.variant")
    .populate("user")
    .populate("coupon");

  return res.status(200).json(new ApiResponse(200, "Coupon applied", normalizeCart(populatedCart)));
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, applyCoupon };