const express = require("express");
const { prisma } = require("../config/db");
// Model Review removed
const buildCrudController = require("../controllers/crudController");
const { protect } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(prisma.review, "Review", { include: { user: true, product: true, order: true } });
const router = express.Router();

router.get("/", controller.list);
router.get("/:id", param("id").isUUID(), validate, controller.getById);
router.post("/", protect, controller.create);
router.patch("/:id", protect, param("id").isUUID(), validate, controller.update);
router.delete("/:id", protect, param("id").isUUID(), validate, controller.remove);

module.exports = router;