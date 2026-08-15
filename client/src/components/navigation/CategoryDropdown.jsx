import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuSections = [
  {
    title: "Shop By Category",
    links: [
      { label: "Split ACs", to: "/shop?category=Split%20ACs" },
      { label: "Window ACs", to: "/shop?category=Window%20ACs" },
      { label: "Portable ACs", to: "/shop?category=Portable%20ACs" },
      { label: "Inverter ACs", to: "/shop?category=Inverter%20ACs" },
      { label: "Air Coolers", to: "/shop?category=Air%20Coolers" },
    ],
  },
];

function CategoryDropdown({ inline = false, onSelect }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open || inline) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, inline]);

  const handleLinkClick = () => {
    setOpen(false);
    if (onSelect) onSelect();
  };

  if (inline) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-3.5 py-2.5 rounded-lg bg-sky-50 text-sky-800 text-sm font-semibold border border-sky-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Menu size={18} className="text-sky-600" />
            <span>Categories</span>
          </div>
          <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="mt-2 space-y-1 rounded-xl bg-slate-50 p-2 border border-slate-200">
            {menuSections.map((section) => (
              <div key={section.title}>
                <div className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </div>
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={handleLinkClick}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:text-sky-600 rounded-md transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-1.5 rounded-md bg-sky-50 px-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 border border-sky-100"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Menu size={18} />
        Categories
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 top-full z-50 mt-2 w-[min(92vw,340px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-sky-50 px-4 py-3 text-sky-900">
                <span className="font-display text-sm font-bold">Browse Air Covo</span>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto py-2">
                {menuSections.map((section, idx) => (
                  <div key={section.title}>
                    {idx > 0 && <div className="mx-4 my-1 border-t border-slate-200" />}
                    <h3 className="px-5 py-2 text-base font-bold text-slate-900">{section.title}</h3>
                    <ul>
                      {section.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            to={link.to}
                            onClick={handleLinkClick}
                            className="block px-5 py-2.5 text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-800"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CategoryDropdown;
