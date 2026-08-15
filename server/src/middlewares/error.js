const ApiError = require("../utils/ApiError");

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

function errorHandler(err, req, res, _next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    error = new ApiError(error.statusCode || 500, error.message || "Internal Server Error");
  }

  if (error.name === "CastError") {
    error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
  }

  if (error.code === 11000 || error.code === "P2002") {
    const target = error.meta?.target || Object.keys(error.keyValue || {})[0] || "field";
    error = new ApiError(400, `A product or record with this ${target} already exists. Please use a unique value.`);
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((item) => item.message);
    error = new ApiError(422, messages.join(", "));
  }

  if (error.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token");
  }

  if (error.name === "TokenExpiredError") {
    error = new ApiError(401, "Token expired");
  }

  if (error.name === "MulterError") {
    error = new ApiError(400, error.message);
  }

  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.message || "Internal Server Error",
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== "production") {
    payload.stack = error.stack;
    payload.path = req.originalUrl;
  }

  res.status(statusCode).json(payload);
}

module.exports = { notFound, errorHandler };