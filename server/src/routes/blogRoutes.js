const express = require("express");
const Blog = require("../models/Blog");
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const { param, query } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(Blog, { slugField: "slug", populate: ["author"] });
const router = express.Router();

router.get("/", query("keyword").optional().isString().trim(), validate, controller.list);
router.get("/:slug", param("slug").notEmpty(), validate, controller.getById);
router.post("/", protect, authorize("admin"), controller.create);
router.patch("/:slug", protect, authorize("admin"), param("slug").notEmpty(), validate, controller.update);
router.delete("/:slug", protect, authorize("admin"), param("slug").notEmpty(), validate, controller.remove);

module.exports = router;