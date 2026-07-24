import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { closeMobileMenu } from "../../features/ui/uiSlice";
import { X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetCategoriesQuery } from "../../features/api/apiSlice";

const mainLinks = [
  { to: "/", label: "Home" },
  { to: "/collection", label: "Collection" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/contact", label: "Contact Us" },
  { to: "/about", label: "About Us" },
  { to: "/cart", label: "Cart" },
];

function MobileMenu() {
  const dispatch = useDispatch();
  const { mobileMenuOpen, accessToken } = useSelector((state) => state.ui);
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || categoriesData?.categories || [];

  const close = () => dispatch(closeMobileMenu());

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[100] bg-black/60"
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.28 }}
            className="fixed inset-y-0 left-0 z-[101] flex w-[85%] max-w-[340px] flex-col overflow-y-auto bg-white"
          >
            <div className="flex items-center justify-between bg-stone-900 px-5 py-4 text-white">
              <Link
                to={accessToken ? "/account" : "/login"}
                onClick={close}
                className="flex items-center gap-2 font-display text-lg font-bold"
              >
                <User size={22} /> {accessToken ? "Your profile" : "Sign in"}
              </Link>
              <button type="button" onClick={close} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>

            <div className="py-3">
              <h3 className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                Menu
              </h3>
              <ul>
                {mainLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={close}
                      className="block px-5 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {categories.length > 0 && (
              <>
                <div className="mx-5 border-t border-stone-200" />
                <div className="py-3">
                  <h3 className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Shop by category
                  </h3>
                  <ul>
                    {categories.map((cat) => (
                      <li key={cat.name || cat._id}>
                        <Link
                          to={`/shop?category=${encodeURIComponent(cat.name)}`}
                          onClick={close}
                          className="block px-5 py-3 text-sm text-stone-700 transition hover:bg-stone-50"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileMenu;
