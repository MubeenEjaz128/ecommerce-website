export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        accentSoft: "rgb(var(--color-accent-soft) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 24px 80px rgba(15, 23, 42, 0.12)",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Manrope", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(circle at top left, rgba(192,140,93,0.25), transparent 35%), radial-gradient(circle at bottom right, rgba(17,24,39,0.16), transparent 30%)",
      },
    },
  },
  plugins: [],
};