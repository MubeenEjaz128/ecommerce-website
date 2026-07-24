const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");
const bcrypt = require("bcryptjs");
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
  const user = { ...userDoc };
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

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const { rawToken, hashedToken } = createRandomToken();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
      avatarPublicId: "",
      verificationToken: hashedToken,
      verificationTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  const verificationUrl = `${env.clientUrl}/verify-email/${rawToken}`;
  await sendVerificationEmail({ email, name, verificationUrl });

  return res
    .status(201)
    .json(new ApiResponse(201, "Registration successful. Please verify your email.", sanitizeUser(user)));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: hashedToken,
      verificationTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
  });

  return res.status(200).json(new ApiResponse(200, "Email verified successfully", sanitizeUser(updatedUser)));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = createAuthTokens(user);
  
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken: hashToken(refreshToken),
      lastLoginAt: new Date(),
    }
  });

  setRefreshCookie(res, refreshToken);

  return res.status(200).json(
    new ApiResponse(200, "Login successful", {
      user: sanitizeUser(updatedUser),
      accessToken,
    }),
  );
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch (error) {
    // Clear the bad cookie so the browser stops looping
    res.clearCookie("refreshToken", refreshCookieOptions());
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    res.clearCookie("refreshToken", refreshCookieOptions());
    throw new ApiError(401, "Invalid refresh token");
  }

  if (!user.refreshToken || user.refreshToken !== hashToken(refreshToken)) {
    res.clearCookie("refreshToken", refreshCookieOptions());
    throw new ApiError(401, "Refresh token no longer valid");
  }

  const tokens = createAuthTokens(user);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken: hashToken(tokens.refreshToken),
    }
  });

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
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null }
        });
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
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res
      .status(200)
      .json(new ApiResponse(200, "If the email exists, a reset link has been sent"));
  }

  const { rawToken, hashedToken } = createRandomToken();
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
    }
  });

  const resetUrl = `${env.clientUrl}/reset-password/${rawToken}`;
  await sendPasswordResetEmail({ email: user.email, name: user.name, resetUrl });

  return res.status(200).json(new ApiResponse(200, "Password reset email sent"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const tokens = createAuthTokens(user);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
      refreshToken: hashToken(tokens.refreshToken),
      passwordChangedAt: new Date(),
    }
  });

  setRefreshCookie(res, tokens.refreshToken);

  return res.status(200).json(new ApiResponse(200, "Password reset successful", { accessToken: tokens.accessToken }));
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(req.body.newPassword, 12);
  const tokens = createAuthTokens(user);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      refreshToken: hashToken(tokens.refreshToken),
      passwordChangedAt: new Date(),
    }
  });

  setRefreshCookie(res, tokens.refreshToken);

  return res.status(200).json(new ApiResponse(200, "Password changed successfully", { accessToken: tokens.accessToken }));
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  return res.status(200).json(new ApiResponse(200, "Current user fetched", sanitizeUser(user)));
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