import { useEffect, useRef } from "react";
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

  // Keep session alive after page refresh via httpOnly refresh cookie
  // hasAttempted ref prevents an infinite loop: if refresh fails and sets
  // accessToken to "", the effect would re-fire without this guard.
  const hasAttempted = useRef(false);
  useEffect(() => {
    if (accessToken) {
      hasAttempted.current = false; // reset so next logout → visit works
      return;
    }
    if (hasAttempted.current) return;
    hasAttempted.current = true;
    let cancelled = false;
    (async () => {
      try {
        await refreshToken(dispatch, () => ({ ui: { accessToken: "" } }));
      } catch {
        // No valid refresh session — guest browsing is fine
      }
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
  }, [dispatch, accessToken]);
}
