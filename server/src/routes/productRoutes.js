const express = require("express");
const { body, param, query } = require("express-validator");
const { prisma } = require("../config/db");
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const controller = buildCrudController(prisma.product, "Product", {
  slugField: "slug",
  searchFields: ["name", "description"],
  include: { brand: true, category: true, images: true, variants: true, reviews: true },
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

    // Check existing variants in the database
    if (skus.length) {
      const existingVariants = await prisma.productVariant.findMany({
        where: { sku: { in: skus } }
      });
      
      if (existingVariants.length > 0) {
        if (req.params.slug) {
          const prod = await prisma.product.findUnique({ where: { slug: req.params.slug } });
          for (const ev of existingVariants) {
            if (!prod || ev.productId !== prod.id) {
              return res.status(400).json({ success: false, message: `SKU already exists: ${ev.sku}` });
            }
          }
        } else {
          return res.status(400).json({ success: false, message: `SKU already exists: ${existingVariants[0].sku}` });
        }
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
    let whereClause = {};
    if (keyword) {
      whereClause = {
        OR: [
          { name: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } }
        ]
      };
    }
    const items = await prisma.product.findMany({
      where: whereClause,
      select: { name: true, slug: true, price: true, ratingAvg: true, images: { take: 1, select: { url: true } } },
      take: 8,
      orderBy: { createdAt: 'desc' }
    });

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
  body("brandId").isString().notEmpty().withMessage("Brand is required"),
  body("categoryId").isString().notEmpty().withMessage("Category is required"),
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