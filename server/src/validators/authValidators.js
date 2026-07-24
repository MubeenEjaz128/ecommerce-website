const { body, param } = require("express-validator");

const passwordRules = [
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must include at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must include at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must include at least one number"),
];

const registerValidators = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2 }),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  ...passwordRules,
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

const loginValidators = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidators = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
];

const resetPasswordValidators = [
  param("token").trim().notEmpty().withMessage("Reset token is required"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must include at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must include at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must include at least one number"),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

const changePasswordValidators = [
  body("currentPassword").trim().notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must include at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must include at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must include at least one number"),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Passwords do not match"),
];

const verifyEmailValidators = [param("token").trim().notEmpty().withMessage("Verification token is required")];

module.exports = {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  changePasswordValidators,
  verifyEmailValidators,
};