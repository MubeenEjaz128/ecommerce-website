const express = require("express");
const { prisma } = require("../config/db");
// Model Brand removed
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const slugify = require("slugify");

const controller = buildCrudController(prisma.brand, "Brand", { 
  slugField: "slug",
  transformCreate: (req) => {
    const data = { ...req.body };
    if (data.name && !data.slug) data.slug = slugify(data.name, { lower: true, strict: true });
    return data;
  },
  transformUpdate: (req) => {
    const data = { ...req.body };
    if (data.name && !data.slug) data.slug = slugify(data.name, { lower: true, strict: true });
    return data;
  }
});
const router = express.Router();

router.get("/", controller.list);
router.get("/:slug", param("slug").notEmpty(), validate, controller.getById);
router.post("/", protect, authorize("admin"), controller.create);
router.patch("/:slug", protect, authorize("admin"), param("slug").notEmpty(), validate, controller.update);
router.delete("/:slug", protect, authorize("admin"), param("slug").notEmpty(), validate, controller.remove);

module.exports = router;