const express = require("express");
const Banner = require("../models/Banner");
const buildCrudController = require("../controllers/crudController");
const { protect, authorize } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(Banner);
const router = express.Router();

router.get("/", controller.list);
router.get("/:id", param("id").isMongoId(), validate, controller.getById);
router.post("/", protect, authorize("admin"), controller.create);
router.patch("/:id", protect, authorize("admin"), param("id").isMongoId(), validate, controller.update);
router.delete("/:id", protect, authorize("admin"), param("id").isMongoId(), validate, controller.remove);

module.exports = router;