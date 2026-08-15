import { Link } from "react-router-dom";

/** Distinct Air Covo mark — snowflake breeze glyph + wordmark */
function BrandLogo({ size = "md", theme = "dark", className = "" }) {
  const sizes = {
    sm: { box: "h-8 w-8", svg: "h-4.5 w-4.5", text: "text-base sm:text-xl", gap: "gap-2" },
    md: { box: "h-9 w-9 sm:h-11 sm:w-11", svg: "h-5 w-5 sm:h-6 sm:w-6", text: "text-lg sm:text-2xl", gap: "gap-2 sm:gap-3" },
    lg: { box: "h-12 w-12 sm:h-14 sm:w-14", svg: "h-7 w-7 sm:h-8 sm:w-8", text: "text-2xl sm:text-4xl", gap: "gap-3 sm:gap-3.5" },
  };
  const s = sizes[size] || sizes.md;
  const light = theme === "light";

  return (
    <Link to="/" className={`inline-flex items-center ${s.gap} ${className}`}>
      <span
        className={`relative flex ${s.box} shrink-0 items-center justify-center rounded-2xl shadow-sm ${
          light
            ? "bg-sky-500 text-white"
            : "bg-gradient-to-br from-sky-400 to-sky-600 text-white ring-2 ring-sky-300/40"
        }`}
      >
        <svg viewBox="0 0 48 48" className={s.svg} fill="none" aria-hidden>
          <path
            d="M24 6v36M12.5 12.5l23 23M35.5 12.5l-23 23"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M24 6l4.5 6H19.5L24 6zm0 36l4.5-6H19.5L24 42zM12.5 12.5l7 1.5-4 6-3-7.5zm23 0l-7 1.5 4 6 3-7.5zM12.5 35.5l7-1.5-4-6-3 7.5zm23 0l-7-1.5 4-6 3 7.5z"
            fill="currentColor"
            opacity="0.9"
          />
          <circle cx="24" cy="24" r="3.5" fill="currentColor" />
        </svg>
      </span>
      <span className={`font-display font-extrabold leading-none tracking-tight ${s.text}`}>
        <span className={light ? "text-slate-900" : "text-white"}>Air</span>
        <span className={light ? "text-sky-600" : "text-sky-300"}> Covo</span>
      </span>
    </Link>
  );
}

export default BrandLogo;
