const express = require("express");
const { prisma } = require("../config/db");
// Model Brand removed
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(prisma.brand, "Brand", { slugField: "slug" });
const router = express.Router();

router.get("/", controller.list);
router.get("/:slug", param("slug").notEmpty(), validate, controller.getById);
router.post("/", protect, authorize("admin"), controller.create);
router.patch("/:slug", protect, authorize("admin"), param("slug").notEmpty(), validate, controller.update);
router.delete("/:slug", protect, authorize("admin"), param("slug").notEmpty(), validate, controller.remove);

module.exports = router;