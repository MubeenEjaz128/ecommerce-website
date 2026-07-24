const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signToken(payload, secret, expiresIn) {
  return jwt.sign(payload, secret, { expiresIn });
}

function createAuthTokens(user) {
  const accessToken = signToken(
    { id: user._id.toString(), role: user.role },
    env.jwtAccessSecret,
    env.accessExpiry,
  );

  const refreshToken = signToken(
    { id: user._id.toString() },
    env.jwtRefreshSecret,
    env.refreshExpiry,
  );

  return { accessToken, refreshToken };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createRandomToken(bytes = 32) {
  const rawToken = crypto.randomBytes(bytes).toString("hex");
  return {
    rawToken,
    hashedToken: hashToken(rawToken),
  };
}

function expiryToMilliseconds(expiry) {
  if (!expiry) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const match = String(expiry).trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const unitMap = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * unitMap[unit];
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    path: "/api/v1/auth",
    maxAge: expiryToMilliseconds(env.refreshExpiry),
  };
}

module.exports = {
  createAuthTokens,
  createRandomToken,
  hashToken,
  refreshCookieOptions,
  expiryToMilliseconds,
};