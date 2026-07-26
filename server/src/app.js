const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const productRoutes = require("./routes/productRoutes");
const productVariantRoutes = require("./routes/productVariantRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const addressRoutes = require("./routes/addressRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderItemRoutes = require("./routes/orderItemRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const couponRoutes = require("./routes/couponRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const blogRoutes = require("./routes/blogRoutes");
const contactMessageRoutes = require("./routes/contactMessageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const cardVerificationRoutes = require("./routes/cardVerificationRoutes");
const { apiLimiter } = require("./middlewares/rateLimit");
const { notFound, errorHandler } = require("./middlewares/error");

const { prisma } = require("./config/db");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = env.clientUrl.split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// express-mongo-sanitize removed due to incompatibility with Express 5 req.query getter
// xss-clean removed due to incompatibility with Express 5 req.query getter
app.use(compression());

if (env.nodeEnv !== "production") {
  app.use(morgan("dev"));
}

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    maxAge: "1y",
    immutable: true,
  })
);

app.get("/health", async (_req, res) => {
  let dbStatus = "disconnected";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (error) {
    dbStatus = `error: ${error.message}`;
  }

  const isOk = dbStatus === "connected";
  res.status(isOk ? 200 : 503).json({
    success: isOk,
    message: isOk ? "API and Database are healthy" : "Database connection issue",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.use(apiLimiter);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/product-variants", productVariantRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/order-items", orderItemRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/contact-messages", contactMessageRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/card-verifications", cardVerificationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;