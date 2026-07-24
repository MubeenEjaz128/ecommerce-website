const express = require("express");
const Payment = require("../models/Payment");
const buildCrudController = require("../controllers/crudController");
const paymentController = require("../controllers/paymentController");
const { protect, authorize } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const controller = buildCrudController(Payment, { populate: ["order", "user"] });
const router = express.Router();

// Stripe payment intent endpoint (requires auth)
router.post('/create-intent', protect, paymentController.createPaymentIntent);

// Stripe webhook - uses raw body; no auth
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhookHandler);

// Stripe Checkout session creation
router.post('/create-checkout-session', protect, paymentController.createCheckoutSession);
router.get('/session', protect, paymentController.getSession);

router.get("/", protect, authorize("admin"), controller.list);
router.get("/:id", protect, param("id").isMongoId(), validate, controller.getById);
router.post("/", protect, controller.create);
router.patch("/:id", protect, param("id").isMongoId(), validate, controller.update);
router.delete("/:id", protect, authorize("admin"), param("id").isMongoId(), validate, controller.remove);

module.exports = router;