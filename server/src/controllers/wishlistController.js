const { prisma } = require("../config/db");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getWishlist = asyncHandler(async (req, res) => {
  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: { product: true }
  });
  
  const wishlist = {
    user: req.user.id,
    products: wishlistItems.map(item => item.product)
  };

  return res.status(200).json(new ApiResponse(200, "Wishlist fetched", wishlist));
});

const addProduct = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId: req.user.id,
        productId: product.id
      }
    }
  });

  if (!existing) {
    await prisma.wishlist.create({
      data: {
        userId: req.user.id,
        productId: product.id
      }
    });
  }

  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: { product: true }
  });
  
  const wishlist = {
    user: req.user.id,
    products: wishlistItems.map(item => item.product)
  };

  return res.status(200).json(new ApiResponse(200, "Product added to wishlist", wishlist));
});

const removeProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId: req.user.id,
        productId: productId
      }
    }
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: productId
        }
      }
    });
  }

  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: { product: true }
  });
  
  const wishlist = {
    user: req.user.id,
    products: wishlistItems.map(item => item.product)
  };

  return res.status(200).json(new ApiResponse(200, "Product removed from wishlist", wishlist));
});

module.exports = { getWishlist, addProduct, removeProduct };