const express = require("express");
const { body, param, query } = require("express-validator");
const { prisma } = require("../config/db");
// Model Product removed
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const controller = buildCrudController(prisma.product, "Product", {
  slugField: "slug",
  searchFields: ["name", "description", "tags"],
  include: { brand: true, category: true },
  defaultSort: "-createdAt",
});

// Validate SKUs in request body for create/update: ensure no duplicate SKUs in payload and no collisions with other products
async function validateVariantSkus(req, res, next) {
  try {
    const variants = Array.isArray(req.body.variants) ? req.body.variants : [];
    const skus = variants.map((v) => String(v.sku || "").trim()).filter(Boolean);
    // duplicates in payload
    const dup = skus.find((s, i) => skus.indexOf(s) !== i);
    if (dup) return res.status(400).json({ success: false, message: `Duplicate SKU in variants: ${dup}` });

// Model ProductVariant removed
    // Check ProductVariant collection for existing SKU used by another product
    for (const sku of skus) {
      const existing = await ProductVariant.findOne({ sku });
      if (existing) {
        if (req.params.slug) {
          const prod = await Product.findOne({ slug: req.params.slug });
          if (!prod || String(existing.product) !== String(prod._id)) {
            return res.status(400).json({ success: false, message: `SKU already exists: ${sku}` });
          }
        } else {
          return res.status(400).json({ success: false, message: `SKU already exists: ${sku}` });
        }
      }
    }

    // Also check other products' embedded variants
    if (skus.length) {
      const other = await Product.find({ "variants.sku": { $in: skus } });
      if (other && other.length) {
        // If updating, exclude current product by slug
        const conflicts = [];
        for (const p of other) {
          if (req.params.slug && p.slug === req.params.slug) continue;
          for (const v of p.variants || []) if (skus.includes(v.sku)) conflicts.push(v.sku);
        }
        if (conflicts.length) return res.status(400).json({ success: false, message: `SKU(s) already used: ${[...new Set(conflicts)].join(", ")}` });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

const router = express.Router();

router.get(
  "/",
  query("keyword").optional().isString().trim(),
  query("category").optional().isString().trim(),
  query("brand").optional().isString().trim(),
  validate,
  controller.list,
);
router.get("/suggestions", query("q").optional().isString().trim(), validate, async (req, res, next) => {
  try {
    const keyword = String(req.query.q || "").trim();
    const items = await Product.find(keyword ? { $text: { $search: keyword } } : {})
      .select("name slug images price ratingAvg")
      .limit(8)
      .sort("-createdAt");

    return res.status(200).json({ success: true, message: "Suggestions fetched", data: items });
  } catch (error) {
    return next(error);
  }
});
router.get("/:slug", param("slug").notEmpty().withMessage("Slug is required"), validate, controller.getById);
router.post(
  "/",
  protect,
  authorize("admin"),
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isNumeric().withMessage("Price must be numeric"),
  body("brand").isString().notEmpty().withMessage("Brand is required"),
  body("category").isString().notEmpty().withMessage("Category is required"),
  validateVariantSkus,
  validate,
  controller.create,
);
router.patch(
  "/:slug",
  protect,
  authorize("admin"),
  param("slug").notEmpty().withMessage("Slug is required"),
  validateVariantSkus,
  validate,
  controller.update,
);
router.delete("/:slug", protect, authorize("admin"), param("slug").notEmpty(), validate, controller.remove);

module.exports = router;