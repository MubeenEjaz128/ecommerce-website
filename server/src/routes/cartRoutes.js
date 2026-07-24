const express = require("express");
const { protect } = require("../middlewares/auth");
const { body, param } = require("express-validator");
const validate = require("../middlewares/validate");
const { getCart, addItem, updateItem, removeItem, clearCart, applyCoupon } = require("../controllers/cartController");

const router = express.Router();

router.get("/", protect, getCart);
router.post(
	"/items",
	protect,
	body("productId").isMongoId().withMessage("Product is required"),
	body("quantity").optional().isInt({ min: 1 }),
	body("variantId").optional().isMongoId(),
	validate,
	addItem,
);
router.patch("/items/:itemId", protect, param("itemId").isMongoId(), validate, updateItem);
router.delete("/items/:itemId", protect, param("itemId").isMongoId(), validate, removeItem);
router.delete("/", protect, clearCart);
router.patch("/coupon", protect, body("code").trim().notEmpty().withMessage("Coupon code is required"), validate, applyCoupon);

module.exports = router;