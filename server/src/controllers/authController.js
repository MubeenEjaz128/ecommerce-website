const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");
const {
  createAuthTokens,
  createRandomToken,
  hashToken,
  refreshCookieOptions,
} = require("../utils/token");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../services/emailService");

function sanitizeUser(userDoc) {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
  delete user.refreshToken;
  delete user.verificationToken;
  delete user.verificationTokenExpiresAt;
  delete user.resetPasswordToken;
  delete user.resetPasswordTokenExpiresAt;
  return user;
}

function setRefreshCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, refreshCookieOptions());
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, avatarUrl } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      url: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
      publicId: "",
    },
  });

  const { rawToken, hashedToken } = createRandomToken();
  user.verificationToken = hashedToken;
  user.verificationTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${env.clientUrl}/verify-email/${rawToken}`;
  await sendVerificationEmail({ email, name, verificationUrl });

  return res
    .status(201)
    .json(new ApiResponse(201, "Registration successful. Please verify your email.", sanitizeUser(user)));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiresAt = null;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, "Email verified successfully", sanitizeUser(user)));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  // if (!user.isVerified) {
  //   throw new ApiError(403, "Please verify your email before logging in");
  // }

  const { accessToken, refreshToken } = createAuthTokens(user);
  user.refreshToken = hashToken(refreshToken);
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  setRefreshCookie(res, refreshToken);

  return res.status(200).json(
    new ApiResponse(200, "Login successful", {
      user: sanitizeUser(user),
      accessToken,
    }),
  );
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (!user.refreshToken || user.refreshToken !== hashToken(refreshToken)) {
    throw new ApiError(401, "Refresh token no longer valid");
  }

  const tokens = createAuthTokens(user);
  user.refreshToken = hashToken(tokens.refreshToken);
  await user.save({ validateBeforeSave: false });

  setRefreshCookie(res, tokens.refreshToken);

  return res.status(200).json(
    new ApiResponse(200, "Token refreshed", {
      accessToken: tokens.accessToken,
    }),
  );
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
      const user = await User.findById(decoded.id).select("+refreshToken");
      if (user) {
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });
      }
    } catch {
      // Ignore invalid logout tokens; the cookie will still be cleared.
    }
  }

  res.clearCookie("refreshToken", refreshCookieOptions());
  return res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(200)
      .json(new ApiResponse(200, "If the email exists, a reset link has been sent"));
  }

  const { rawToken, hashedToken } = createRandomToken();
  user.resetPasswordToken = hashedToken;
  user.resetPasswordTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password/${rawToken}`;
  await sendPasswordResetEmail({ email: user.email, name: user.name, resetUrl });

  return res.status(200).json(new ApiResponse(200, "Password reset email sent"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordTokenExpiresAt: { $gt: new Date() },
  }).select("+password +refreshToken");

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordTokenExpiresAt = null;
  user.refreshToken = null;
  user.passwordChangedAt = new Date();
  await user.save();

  const tokens = createAuthTokens(user);
  user.refreshToken = hashToken(tokens.refreshToken);
  await user.save({ validateBeforeSave: false });
  setRefreshCookie(res, tokens.refreshToken);

  return res.status(200).json(new ApiResponse(200, "Password reset successful", { accessToken: tokens.accessToken }));
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+password +refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await user.comparePassword(req.body.currentPassword);
  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = req.body.newPassword;
  user.refreshToken = null;
  user.passwordChangedAt = new Date();
  await user.save();

  const tokens = createAuthTokens(user);
  user.refreshToken = hashToken(tokens.refreshToken);
  await user.save({ validateBeforeSave: false });
  setRefreshCookie(res, tokens.refreshToken);

  return res.status(200).json(new ApiResponse(200, "Password changed successfully", { accessToken: tokens.accessToken }));
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-password -refreshToken -verificationToken -verificationTokenExpiresAt -resetPasswordToken -resetPasswordTokenExpiresAt",
  );
  return res.status(200).json(new ApiResponse(200, "Current user fetched", user));
});

module.exports = {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  me,
};