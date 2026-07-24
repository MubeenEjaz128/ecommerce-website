const express = require("express");
const { protect } = require("../middlewares/auth");
const { body, param } = require("express-validator");
const validate = require("../middlewares/validate");
const { getWishlist, addProduct, removeProduct } = require("../controllers/wishlistController");

const router = express.Router();

router.get("/", protect, getWishlist);
router.post(
	"/items",
	protect,
	body("productId").isMongoId().withMessage("Product is required"),
	validate,
	addProduct,
);
router.delete("/items/:productId", protect, param("productId").isMongoId(), validate, removeProduct);

module.exports = router;