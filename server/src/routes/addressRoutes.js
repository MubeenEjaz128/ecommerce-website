const express = require("express");
const Address = require("../models/Address");
const buildCrudController = require("../controllers/crudController");
const { protect } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(Address, { populate: ["user"] });
const router = express.Router();

router.get("/", protect, controller.list);
router.get("/:id", protect, param("id").isMongoId(), validate, controller.getById);
router.post("/", protect, controller.create);
router.patch("/:id", protect, param("id").isMongoId(), validate, controller.update);
router.delete("/:id", protect, param("id").isMongoId(), validate, controller.remove);

module.exports = router;