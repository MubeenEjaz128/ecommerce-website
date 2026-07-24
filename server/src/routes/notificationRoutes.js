const express = require("express");
const Notification = require("../models/Notification");
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(Notification, { populate: ["user"] });
const router = express.Router();

router.get("/", protect, controller.list);
router.get("/:id", protect, param("id").isMongoId(), validate, controller.getById);
router.post("/", protect, authorize("admin"), controller.create);
router.patch("/:id", protect, param("id").isMongoId(), validate, controller.update);
router.delete("/:id", protect, authorize("admin"), param("id").isMongoId(), validate, controller.remove);

module.exports = router;