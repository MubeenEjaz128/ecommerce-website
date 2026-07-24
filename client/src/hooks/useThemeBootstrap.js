import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../features/ui/uiSlice";
import { refreshToken } from "../utils/auth";

export function useThemeBootstrap() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  const accessToken = useSelector((state) => state.ui.accessToken);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      dispatch(setTheme(stored));
    }
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Keep session alive after refresh via httpOnly refresh cookie
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (accessToken) return;
      try {
        await refreshToken(dispatch, () => ({ ui: { accessToken: "" } }));
      } catch {
        // No valid refresh session — guest browsing is fine
      }
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, accessToken]);
}
