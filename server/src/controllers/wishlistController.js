const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

async function getOrCreateWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId }).populate("products");
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
    wishlist = await Wishlist.findById(wishlist._id).populate("products");
  }

  return wishlist;
}

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user.id);
  return res.status(200).json(new ApiResponse(200, "Wishlist fetched", wishlist));
});

const addProduct = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const wishlist = await getOrCreateWishlist(req.user.id);
  const alreadyExists = wishlist.products.some((item) => item._id.toString() === productId);
  if (!alreadyExists) {
    wishlist.products.push(product._id);
    await wishlist.save();
  }

  await wishlist.populate("products");
  return res.status(200).json(new ApiResponse(200, "Product added to wishlist", wishlist));
});

const removeProduct = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  wishlist.products = wishlist.products.filter((item) => item.toString() !== req.params.productId);
  await wishlist.save();
  await wishlist.populate("products");
  return res.status(200).json(new ApiResponse(200, "Product removed from wishlist", wishlist));
});

module.exports = { getWishlist, addProduct, removeProduct };