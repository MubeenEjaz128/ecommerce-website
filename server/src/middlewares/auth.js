const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { prisma } = require("../config/db");
const env = require("../config/env");

const protect = asyncHandler(async (req, _res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    console.error("Auth middleware: token missing in headers/cookies");
    throw new ApiError(401, "Not authorized, token missing");
  }

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      console.error(`Auth middleware: user not found for id ${decoded.id}`);
      throw new ApiError(401, "User no longer exists");
    }

    // Remove password from user object
    delete user.password;
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    if (err.name === 'JsonWebTokenError') throw new ApiError(401, "Invalid token");
    if (err.name === 'TokenExpiredError') throw new ApiError(401, "Token expired");
    throw err;
  }
});

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Not authorized"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden: insufficient permissions"));
    }

    return next();
  };
}

const optionalAuth = asyncHandler(async (req, _res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token || token === "null" || token === "undefined") {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (user) {
      delete user.password;
      req.user = user;
    }
    next();
  } catch (err) {
    next();
  }
});

module.exports = { protect, authorize, optionalAuth };