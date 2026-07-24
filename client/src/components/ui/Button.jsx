function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-text text-canvas hover:opacity-90",
    soft: "bg-accentSoft text-text hover:bg-accentSoft/80",
    ghost: "border border-border bg-transparent text-text hover:border-accent",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;