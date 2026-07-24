const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const isDev = env.nodeEnv !== "production";

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: isDev ? 10000 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again in 5 minutes." },
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: isDev ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please wait 5 minutes." },
});

module.exports = { apiLimiter, authLimiter };