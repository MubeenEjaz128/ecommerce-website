const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");
const { createOrder, getMyOrders, getOrderById, cancelOrder, getInvoice, getAllOrders, updateOrderStatus, refundOrder } = require("../controllers/orderController");

const router = express.Router();

router.get("/", protect, getMyOrders);
// Admin: list all orders
router.get("/all", protect, authorize("admin"), getAllOrders);
router.get("/:id", protect, param("id").isMongoId(), validate, getOrderById);
router.post("/", protect, createOrder);
router.get("/:id/invoice", protect, param("id").isMongoId(), validate, getInvoice);
router.patch("/:id/cancel", protect, param("id").isMongoId(), validate, cancelOrder);
router.delete("/:id", protect, authorize("admin"), param("id").isMongoId(), validate, cancelOrder);
// Admin update status
router.patch("/:id/status", protect, authorize("admin"), param("id").isMongoId(), validate, updateOrderStatus);
// Admin refund
router.post("/:id/refund", protect, authorize("admin"), param("id").isMongoId(), validate, refundOrder);

module.exports = router;