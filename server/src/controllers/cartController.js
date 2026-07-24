const { prisma } = require("../config/db");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

function calculateTotals(items, shippingFee = 0, taxRate = 0.08) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxFee = Number((subtotal * taxRate).toFixed(2));
  const total = Number((subtotal + shippingFee + taxFee).toFixed(2));
  return { subtotal: Number(subtotal.toFixed(2)), taxFee, total };
}

async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      user: true,
      coupon: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        user: true,
        coupon: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  return cart;
}

function normalizeCart(cart) {
  const totals = calculateTotals(cart.items, cart.shippingFee || 0);
  cart.subtotal = totals.subtotal;
  cart.taxFee = totals.taxFee;
  cart.total = totals.total;
  return cart;
}

const getCart = asyncHandler(async (req, res) => {
  const cart = normalizeCart(await getOrCreateCart(req.user.id));
  return res.status(200).json(new ApiResponse(200, "Cart fetched", cart));
});

const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variantId = null, saveForLater = false } = req.body;
  
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const cart = await getOrCreateCart(req.user.id);

  const existingItem = cart.items.find(
    (item) => item.productId === productId && (item.variantId || null) === (variantId || null)
  );

  let itemPrice = (product.compareAtPrice && product.compareAtPrice > product.price) 
    ? (product.price - (product.price * product.discount) / 100)
    : (product.discount > 0 ? (product.price - (product.price * product.discount) / 100) : product.price);

  let resolvedVariantId = variantId || null;

  if (variantId) {
    const pv = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (pv) {
      itemPrice = pv.price !== undefined ? pv.price : itemPrice;
      resolvedVariantId = pv.id;
    }
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + Number(quantity),
        saveForLater,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        variantId: resolvedVariantId,
        quantity: Number(quantity),
        price: itemPrice,
        saveForLater,
      },
    });
  }

  const updatedCart = await getOrCreateCart(req.user.id);
  return res.status(200).json(new ApiResponse(200, "Item added to cart", normalizeCart(updatedCart)));
});

const updateItem = asyncHandler(async (req, res) => {
  const { quantity, saveForLater } = req.body;
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });
  if (!item || item.cartId !== cart.id) {
    throw new ApiError(404, "Cart item not found");
  }

  const dataToUpdate = {};
  if (typeof quantity !== "undefined") {
    dataToUpdate.quantity = Math.max(1, Number(quantity));
  }
  if (typeof saveForLater !== "undefined") {
    dataToUpdate.saveForLater = Boolean(saveForLater);
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: dataToUpdate,
  });

  const updatedCart = await getOrCreateCart(req.user.id);
  return res.status(200).json(new ApiResponse(200, "Cart item updated", normalizeCart(updatedCart)));
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });
  if (item && item.cartId === cart.id) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  }

  const updatedCart = await getOrCreateCart(req.user.id);
  return res.status(200).json(new ApiResponse(200, "Cart item removed", normalizeCart(updatedCart)));
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  const updatedCart = await getOrCreateCart(req.user.id);
  return res.status(200).json(new ApiResponse(200, "Cart cleared", normalizeCart(updatedCart)));
});

const applyCoupon = asyncHandler(async (req, res) => {
  const couponCode = String(req.body.code || "").trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });

  if (!coupon || !coupon.active) {
    throw new ApiError(404, "Coupon not found");
  }

  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  await prisma.cart.update({
    where: { id: cart.id },
    data: { couponId: coupon.id },
  });

  const updatedCart = await getOrCreateCart(req.user.id);
  return res.status(200).json(new ApiResponse(200, "Coupon applied", normalizeCart(updatedCart)));
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, applyCoupon };