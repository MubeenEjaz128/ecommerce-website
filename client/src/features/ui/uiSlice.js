import { createSlice } from "@reduxjs/toolkit";

const storedTheme = localStorage.getItem("theme");
const initialTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
const storedToken = localStorage.getItem("accessToken") || "";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    theme: initialTheme,
    accessToken: storedToken,
    mobileMenuOpen: false,
  },
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    setAccessToken(state, action) {
      const token = action.payload || "";
      state.accessToken = token;
      if (token) {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("hasSession", "true");
      } else {
        localStorage.removeItem("accessToken");
      }
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu(state) {
      state.mobileMenuOpen = false;
    },
  },
});

export const { setTheme, toggleTheme, setAccessToken, toggleMobileMenu, closeMobileMenu } = uiSlice.actions;
export default uiSlice.reducer;
