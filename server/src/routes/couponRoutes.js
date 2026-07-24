const express = require("express");
const Coupon = require("../models/Coupon");
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(Coupon, { slugField: "slug", paramName: "code" });
const router = express.Router();

router.get("/", protect, authorize("admin"), controller.list);
router.get("/:code", protect, authorize("admin"), param("code").notEmpty(), validate, controller.getById);
router.post("/", protect, authorize("admin"), controller.create);
router.patch("/:code", protect, authorize("admin"), param("code").notEmpty(), validate, controller.update);
router.delete("/:code", protect, authorize("admin"), param("code").notEmpty(), validate, controller.remove);

module.exports = router;