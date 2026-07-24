const express = require("express");
const { prisma } = require("../config/db");
// Model Settings removed
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(prisma.settings, "Settings");
const router = express.Router();

router.get("/", protect, authorize("admin"), controller.list);
router.get("/:id", protect, authorize("admin"), param("id").isUUID(), validate, controller.getById);
router.post("/", protect, authorize("admin"), controller.create);
router.patch("/:id", protect, authorize("admin"), param("id").isUUID(), validate, controller.update);
router.delete("/:id", protect, authorize("admin"), param("id").isUUID(), validate, controller.remove);

module.exports = router;