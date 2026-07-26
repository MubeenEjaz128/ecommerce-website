import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, User, X, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetCartQuery } from "../../features/api/apiSlice";
import SearchBar from "./SearchBar";
import CategoryDropdown from "./CategoryDropdown";
import LanguageDropdown from "./LanguageDropdown";
import BrandLogo from "./BrandLogo";

function Navbar() {
  const { accessToken } = useSelector((state) => state.ui);
  const guestCartItems = useSelector((state) => state.guestCart.items);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
      className="sticky top-0 z-50 w-full max-w-full border-b border-slate-200 bg-[rgb(var(--color-nav-bg))]/95 text-slate-800 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-2 py-2.5 sm:gap-3 sm:px-6 lg:gap-4 lg:px-8">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => {
            setMobileOpen((v) => !v);
            setSearchOpen(false);
          }}
          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 lg:hidden shrink-0"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Brand Logo */}
        <BrandLogo size="md" theme="light" className="shrink-0 min-w-0" />

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-0.5 sm:gap-2 shrink-0">
          {/* Desktop Navigation Links */}
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

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex">
            <SearchBar />
          </div>

          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setSearchOpen((v) => !v);
              setMobileOpen(false);
            }}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 lg:hidden shrink-0"
            aria-label="Toggle search"
          >
            <Search size={19} />
          </button>

          {/* Category Dropdown on Tablet Header */}
          <div className="hidden sm:block lg:hidden">
            <CategoryDropdown />
          </div>

          {/* Language Dropdown on Tablet Header */}
          <div className="hidden sm:block lg:hidden">
            <LanguageDropdown align="right" />
          </div>

          {/* Cart Link */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 shrink-0"
            aria-label={`Cart with ${cartItemCount} items`}
          >
            <ShoppingCart size={20} />
            <AnimatePresence mode="wait">
              <motion.span
                key={cartItemCount}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="absolute right-0 top-0 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] sm:text-[11px] font-bold text-white"
              >
                {cartItemCount}
              </motion.span>
            </AnimatePresence>
          </Link>

          {/* User Profile Link */}
          <Link
            to={accessToken ? "/orders" : "/login"}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 shrink-0"
            aria-label="Profile"
          >
            <User size={20} />
          </Link>
        </div>
      </div>

      {/* Mobile Search Overlay Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200 bg-slate-50 px-4 py-3 lg:hidden"
          >
            <SearchBar compact onClose={() => setSearchOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Hamburger Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-200 bg-white shadow-md lg:hidden"
          >
            <div className="flex flex-col gap-2.5 px-4 py-3">
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

              <div className="py-0.5">
                <CategoryDropdown inline onSelect={() => setMobileOpen(false)} />
              </div>

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

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Language</span>
                <LanguageDropdown inline />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;
