const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const isDev = env.nodeEnv !== "production";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isDev ? 10000 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isDev ? 1000 : 100, // Generous limit — refresh, register, login all count
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please wait a bit." },
});

module.exports = { apiLimiter, authLimiter };