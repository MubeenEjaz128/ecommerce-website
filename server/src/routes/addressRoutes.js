const express = require("express");
const { prisma } = require("../config/db");
// Model Address removed
const buildCrudController = require("../controllers/crudController");
const { protect } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(prisma.address, "Address", { include: { user: true } });
const router = express.Router();

router.get("/", protect, controller.list);
router.get("/:id", protect, param("id").isUUID(), validate, controller.getById);
router.post("/", protect, controller.create);
router.patch("/:id", protect, param("id").isUUID(), validate, controller.update);
router.delete("/:id", protect, param("id").isUUID(), validate, controller.remove);

module.exports = router;