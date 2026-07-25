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
  // Soft signal check (hasSession hint) avoids unnecessary 401 network logs for first-time guest visitors
  const hasAttempted = useRef(false);
  useEffect(() => {
    if (accessToken) {
      hasAttempted.current = false;
      return;
    }
    if (hasAttempted.current) return;

    // Check soft signal hints in localStorage
    const hasSessionHint = localStorage.getItem("hasSession") === "true";
    const hasStoredToken = Boolean(localStorage.getItem("accessToken"));
    
    // If user has never logged in on this browser (pure guest), skip background refresh call
    if (!hasSessionHint && !hasStoredToken) {
      return;
    }

    hasAttempted.current = true;
    let cancelled = false;
    (async () => {
      try {
        const result = await refreshToken(dispatch, () => ({ ui: { accessToken: "" } }));
        if (!result) {
          localStorage.removeItem("hasSession");
          localStorage.removeItem("accessToken");
        }
      } catch {
        localStorage.removeItem("hasSession");
        localStorage.removeItem("accessToken");
      }
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
  }, [dispatch, accessToken]);
}
