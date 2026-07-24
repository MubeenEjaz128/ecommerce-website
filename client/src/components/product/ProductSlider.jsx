import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

const PER_PAGE = 4;

function ProductSlider({ products = [], isLoading = false }) {
  const pages = [];
  for (let i = 0; i < products.length; i += PER_PAGE) {
    pages.push(products.slice(i, i + PER_PAGE));
  }

  const pageCount = Math.max(pages.length, 1);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setPage(0);
  }, [products.length]);

  const goTo = (next, dir) => {
    setDirection(dir);
    setPage(next);
  };

  if (isLoading && !products.length) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse bg-slate-200" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return <p className="py-8 text-center text-slate-500">No products yet.</p>;
  }

  const current = pages[page] || pages[0] || [];

  return (
    <div className="relative px-0 md:px-8">
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            initial={{ x: direction > 0 ? "35%" : "-35%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? "-35%" : "35%", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          >
            {current.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
            {current.length < PER_PAGE &&
              [...Array(PER_PAGE - current.length)].map((_, i) => (
                <div key={`pad-${i}`} className="hidden md:block" />
              ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {pageCount > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous products"
            onClick={() => goTo((page - 1 + pageCount) % pageCount, -1)}
            className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center border border-slate-200 bg-white p-2.5 text-slate-700 shadow-md transition hover:border-sky-500 hover:text-sky-700 md:-translate-x-1"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Next products"
            onClick={() => goTo((page + 1) % pageCount, 1)}
            className="absolute right-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center border border-slate-200 bg-white p-2.5 text-slate-700 shadow-md transition hover:border-sky-500 hover:text-sky-700 md:translate-x-1"
          >
            <ChevronRight size={22} />
          </button>

          <div className="mt-5 flex justify-center gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i, i > page ? 1 : -1)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === page ? "w-8 bg-sky-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductSlider;
