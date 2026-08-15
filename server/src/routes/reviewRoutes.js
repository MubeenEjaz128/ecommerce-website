const express = require("express");
const { prisma } = require("../config/db");
const { protect } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const router = express.Router();

async function updateProductRating(productId) {
  if (!productId) return;
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const ratingCount = reviews.length;
    const ratingAvg = ratingCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAvg: Math.round(ratingAvg * 10) / 10,
        ratingCount,
      },
    });
  } catch (err) {
    console.error("Failed to update product rating:", err);
  }
}

// GET /api/v1/reviews
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { productId, userId } = req.query;
    const where = {};
    if (productId) where.productId = productId;
    if (userId) where.userId = userId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(new ApiResponse(200, "Reviews fetched", reviews));
  })
);

// POST /api/v1/reviews
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const productId = req.body.productId || req.body.product;
    const { rating, title, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User authentication required" });
    }

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: "Valid rating between 1 and 5 is required" });
    }

    // Check if review already exists for this user & product
    const existing = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    let review;
    if (existing) {
      review = await prisma.review.update({
        where: { id: existing.id },
        data: {
          rating: numericRating,
          title: title !== undefined ? title : existing.title,
          comment: comment !== undefined ? comment : existing.comment,
        },
      });
    } else {
      review = await prisma.review.create({
        data: {
          userId,
          productId,
          rating: numericRating,
          title: title || null,
          comment: comment || "",
        },
      });
    }

    // Recalculate Product rating average and count
    await updateProductRating(productId);

    return res.status(200).json(new ApiResponse(200, "Review saved successfully", review));
  })
);

// DELETE /api/v1/reviews/:id
router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this review" });
    }

    await prisma.review.delete({ where: { id: req.params.id } });
    await updateProductRating(review.productId);

    return res.status(200).json(new ApiResponse(200, "Review deleted successfully"));
  })
);

module.exports = router;