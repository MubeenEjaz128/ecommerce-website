const express = require("express");
const {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  me,
} = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/rateLimit");
const {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  changePasswordValidators,
  verifyEmailValidators,
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", authLimiter, registerValidators, validate, register);
router.get("/verify-email/:token", authLimiter, verifyEmailValidators, validate, verifyEmail);
router.post("/login", authLimiter, loginValidators, validate, login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", authLimiter, logout);
router.post("/forgot-password", authLimiter, forgotPasswordValidators, validate, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPasswordValidators, validate, resetPassword);
router.post("/change-password", protect, changePasswordValidators, validate, changePassword);
router.get("/me", protect, me);

module.exports = router;