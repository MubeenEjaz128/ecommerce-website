import { createSlice } from "@reduxjs/toolkit";

const getInitialCart = () => {
  try {
    const item = localStorage.getItem("guestCart");
    return item ? JSON.parse(item) : [];
  } catch (error) {
    return [];
  }
};

const guestCartSlice = createSlice({
  name: "guestCart",
  initialState: {
    items: getInitialCart(),
  },
  reducers: {
    addToGuestCart(state, action) {
      const { product, quantity, variant } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product._id === product._id && item.variant?._id === variant?._id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          _id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          product,
          quantity,
          variant,
          price: product.price,
          saveForLater: false,
        });
      }
      localStorage.setItem("guestCart", JSON.stringify(state.items));
    },
    updateGuestCartItem(state, action) {
      const { itemId, quantity, saveForLater } = action.payload;
      const item = state.items.find((i) => i._id === itemId);
      if (item) {
        if (quantity !== undefined) item.quantity = quantity;
        if (saveForLater !== undefined) item.saveForLater = saveForLater;
      }
      localStorage.setItem("guestCart", JSON.stringify(state.items));
    },
    removeFromGuestCart(state, action) {
      state.items = state.items.filter((item) => item._id !== action.payload);
      localStorage.setItem("guestCart", JSON.stringify(state.items));
    },
    clearGuestCart(state) {
      state.items = [];
      localStorage.removeItem("guestCart");
    },
  },
});

export const { addToGuestCart, updateGuestCartItem, removeFromGuestCart, clearGuestCart } = guestCartSlice.actions;
export default guestCartSlice.reducer;
