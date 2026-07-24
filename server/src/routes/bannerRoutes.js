const express = require("express");
const { prisma } = require("../config/db");
// Model Banner removed
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(prisma.banner, "Banner");
const router = express.Router();

router.get("/", controller.list);
router.get("/:id", param("id").isUUID(), validate, controller.getById);
router.post("/", protect, authorize("admin"), controller.create);
router.patch("/:id", protect, authorize("admin"), param("id").isUUID(), validate, controller.update);
router.delete("/:id", protect, authorize("admin"), param("id").isUUID(), validate, controller.remove);

module.exports = router;