import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, User, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetCartQuery } from "../../features/api/apiSlice";
import SearchBar from "./SearchBar";
import CategoryDropdown from "./CategoryDropdown";
import LanguageDropdown from "./LanguageDropdown";
import BrandLogo from "./BrandLogo";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/contact", label: "Contact Us" },
  { to: "/about", label: "About Us" },
];

function Navbar() {
  const { accessToken } = useSelector((state) => state.ui);
  const guestCartItems = useSelector((state) => state.guestCart.items);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: cartData } = useGetCartQuery(undefined, { skip: !accessToken });

  const cartItemCount = accessToken
    ? cartData?.data?.items?.reduce((total, item) => total + item.quantity, 0) ||
      cartData?.items?.reduce((total, item) => total + item.quantity, 0) ||
      0
    : guestCartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  const linkClass = ({ isActive }) =>
    `text-sm font-medium tracking-wide transition-colors duration-200 ${
      isActive ? "text-sky-600 font-bold" : "text-slate-600 hover:text-sky-600"
    }`;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 border-b border-slate-200 bg-[rgb(var(--color-nav-bg))]/95 text-slate-800 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5 sm:px-6 lg:gap-4 lg:px-8">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-md p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand Logo */}
        <BrandLogo size="md" theme="light" className="shrink-0" />

        {/* Right side: nav links + All dropdown + search + icons */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Desktop nav links */}
          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink to="/" end className={linkClass} style={{ padding: "6px 10px" }}>
              Home
            </NavLink>
            <CategoryDropdown />

            <NavLink to="/about" className={linkClass} style={{ padding: "6px 10px" }}>
              About Us
            </NavLink>
            <NavLink to="/contact" className={linkClass} style={{ padding: "6px 10px" }}>
              Contact Us
            </NavLink>
            <LanguageDropdown />
          </nav>

          {/* Compact search bar */}
          <div className="hidden lg:flex">
            <SearchBar compact />
          </div>

          {/* Mobile search + All */}
          <div className="flex items-center gap-1 lg:hidden">
            <CategoryDropdown />
            <LanguageDropdown />
            <SearchBar compact />
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center justify-center rounded-md p-2 text-slate-700 transition hover:bg-slate-100"
            aria-label={`Cart with ${cartItemCount} items`}
          >
            <ShoppingCart size={22} />
            <AnimatePresence mode="wait">
              <motion.span
                key={cartItemCount}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1 text-[11px] font-bold text-white"
              >
                {cartItemCount}
              </motion.span>
            </AnimatePresence>
          </Link>

          {/* User / Account */}
          <Link
            to={accessToken ? "/orders" : "/login"}
            className="flex items-center justify-center rounded-md p-2 text-slate-700 transition hover:bg-slate-100"
            aria-label="Profile"
          >
            <User size={22} />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
              <NavLink
                to="/"
                end
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? "bg-sky-50 text-sky-600 font-bold" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? "bg-sky-50 text-sky-600 font-bold" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                About Us
              </NavLink>
              <NavLink
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? "bg-sky-50 text-sky-600 font-bold" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                Contact Us
              </NavLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;
