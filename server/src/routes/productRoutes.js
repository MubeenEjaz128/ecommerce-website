const express = require("express");
const { body, param, query } = require("express-validator");
const { prisma } = require("../config/db");
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const slugify = require("slugify");

const controller = buildCrudController(prisma.product, "Product", {
  slugField: "slug",
  searchFields: ["name", "description"],
  include: { brand: true, category: true, images: true, variants: true, reviews: true },
  defaultSort: "-createdAt",
  transformCreate: (req) => {
    const data = { ...req.body };
    const brandId = data.brandId || data.brand;
    const categoryId = data.categoryId || data.category;

    delete data.brand;
    delete data.category;
    delete data.brandId;
    delete data.categoryId;

    const payload = {
      ...data,
      brandId,
      categoryId,
      price: Number(data.price),
    };

    if (payload.name && !payload.slug) {
      payload.slug = slugify(payload.name, { lower: true, strict: true });
    }

    if (Array.isArray(data.images)) {
      payload.images = {
        create: data.images.map((img) => ({
          url: img.url,
          publicId: img.publicId || null,
          alt: img.alt || payload.name || "",
          isPrimary: Boolean(img.isPrimary),
        })),
      };
    }

    if (Array.isArray(data.variants)) {
      payload.variants = {
        create: data.variants.map((v, i) => ({
          size: v.size || null,
          color: v.color || null,
          sku: String(v.sku || `SKU-${Date.now()}-${i}`).trim(),
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
        })),
      };
    }

    return payload;
  },
  transformUpdate: (req) => {
    const data = { ...req.body };
    const brandId = data.brandId || data.brand;
    const categoryId = data.categoryId || data.category;

    delete data.brand;
    delete data.category;
    delete data.brandId;
    delete data.categoryId;

    const payload = { ...data };
    if (brandId) payload.brandId = brandId;
    if (categoryId) payload.categoryId = categoryId;
    if (payload.price !== undefined) payload.price = Number(payload.price);

    if (payload.name && !payload.slug) {
      payload.slug = slugify(payload.name, { lower: true, strict: true });
    }

    if (Array.isArray(data.images)) {
      payload.images = {
        deleteMany: {},
        create: data.images.map((img) => ({
          url: img.url,
          publicId: img.publicId || null,
          alt: img.alt || payload.name || "",
          isPrimary: Boolean(img.isPrimary),
        })),
      };
    }

    if (Array.isArray(data.variants)) {
      payload.variants = {
        deleteMany: {},
        create: data.variants.map((v, i) => ({
          size: v.size || null,
          color: v.color || null,
          sku: String(v.sku || `SKU-${Date.now()}-${i}`).trim(),
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
        })),
      };
    }

    return payload;
  },
});

// Validate SKUs in request body for create/update
async function validateVariantSkus(req, res, next) {
  try {
    const variants = Array.isArray(req.body.variants) ? req.body.variants : [];
    const skus = variants.map((v) => String(v.sku || "").trim()).filter(Boolean);

    const dup = skus.find((s, i) => skus.indexOf(s) !== i);
    if (dup) return res.status(400).json({ success: false, message: `Duplicate SKU in variants: ${dup}` });

    if (skus.length) {
      const existingVariants = await prisma.productVariant.findMany({
        where: { sku: { in: skus } },
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
        OR: [{ name: { contains: keyword } }, { description: { contains: keyword } }],
      };
    }
    const items = await prisma.product.findMany({
      where: whereClause,
      select: { name: true, slug: true, price: true, ratingAvg: true, images: { take: 1, select: { url: true } } },
      take: 8,
      orderBy: { createdAt: "desc" },
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
  body().custom((reqBody) => {
    if (!reqBody.brandId && !reqBody.brand) {
      throw new Error("Brand is required");
    }
    if (!reqBody.categoryId && !reqBody.category) {
      throw new Error("Category is required");
    }
    return true;
  }),
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