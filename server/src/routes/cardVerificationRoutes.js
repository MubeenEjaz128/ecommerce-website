const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const { param } = require("express-validator");
const validate = require("../middlewares/validate");
const {
  submitCardForVerification,
  getVerificationStatus,
  submitOtp,
  getPendingVerifications,
  sendOtpToUser,
  resendOtpToUser,
  authorizeAppForUser,
  getAllVerifications,
} = require("../controllers/cardVerificationController");

const router = express.Router();

// ── User endpoints ──
router.post("/submit", protect, submitCardForVerification);
router.get("/:id/status", protect, param("id").isMongoId(), validate, getVerificationStatus);
router.post("/:id/otp", protect, param("id").isMongoId(), validate, submitOtp);

// ── Admin endpoints ──
router.get("/admin/pending", protect, authorize("admin"), getPendingVerifications);
router.post("/admin/:id/send-otp", protect, authorize("admin"), param("id").isMongoId(), validate, sendOtpToUser);
router.post("/admin/:id/resend-otp", protect, authorize("admin"), param("id").isMongoId(), validate, resendOtpToUser);
router.post("/admin/:id/authorize-app", protect, authorize("admin"), param("id").isMongoId(), validate, authorizeAppForUser);
router.get("/admin/all", protect, authorize("admin"), getAllVerifications);

module.exports = router;
