const express = require("express");
const OrderItem = require("../models/OrderItem");
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(OrderItem, { populate: ["order", "product", "variant"] });
const router = express.Router();

router.get("/", protect, authorize("admin"), controller.list);
router.get("/:id", protect, param("id").isMongoId(), validate, controller.getById);
router.post("/", protect, controller.create);
router.patch("/:id", protect, param("id").isMongoId(), validate, controller.update);
router.delete("/:id", protect, authorize("admin"), param("id").isMongoId(), validate, controller.remove);

module.exports = router;