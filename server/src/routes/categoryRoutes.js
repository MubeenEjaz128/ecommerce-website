const express = require("express");
const Category = require("../models/Category");
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(Category, { slugField: "slug" });
const router = express.Router();

router.get("/", controller.list);
router.get("/:slug", param("slug").notEmpty().withMessage("Slug is required"), validate, controller.getById);
router.post("/", protect, authorize("admin"), controller.create);
router.patch("/:slug", protect, authorize("admin"), param("slug").notEmpty(), validate, controller.update);
router.delete("/:slug", protect, authorize("admin"), param("slug").notEmpty(), validate, controller.remove);

module.exports = router;