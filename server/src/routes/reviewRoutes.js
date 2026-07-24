const express = require("express");
const Review = require("../models/Review");
const buildCrudController = require("../controllers/crudController");
const { protect } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(Review, { populate: ["user", "product", "order"] });
const router = express.Router();

router.get("/", controller.list);
router.get("/:id", param("id").isMongoId(), validate, controller.getById);
router.post("/", protect, controller.create);
router.patch("/:id", protect, param("id").isMongoId(), validate, controller.update);
router.delete("/:id", protect, param("id").isMongoId(), validate, controller.remove);

module.exports = router;