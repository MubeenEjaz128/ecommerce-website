import { useMemo, useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";

const AC_TYPES = ["all", "Split ACs", "Window ACs", "Portable ACs", "Inverter ACs", "Air Coolers", "Fans"];
const BATCH_SIZE = 12;

function ProductGrid({
  products = [],
  isLoading = false,
  showFilters = true,
  title,
  subtitle,
  emptyMessage = "No products found.",
}) {
  const [type, setType] = useState("all");
  const [brand, setBrand] = useState("all");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState("");
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef(null);

  const brands = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const name = typeof p.brand === "string" ? p.brand : p.brand?.name;
      if (name) set.add(name);
    });
    return ["all", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (type !== "all") {
      list = list.filter((p) => {
        const cat = typeof p.category === "string" ? p.category : p.category?.name;
        const tags = p.tags || [];
        return cat === type || tags.includes(type) || String(p.name || "").toLowerCase().includes(type.toLowerCase().replace(/s$/, ""));
      });
    }

    if (brand !== "all") {
      list = list.filter((p) => {
        const name = typeof p.brand === "string" ? p.brand : p.brand?.name;
        return name === brand;
      });
    }

    if (maxPrice !== "" && !Number.isNaN(Number(maxPrice))) {
      list = list.filter((p) => Number(p.price || 0) <= Number(maxPrice));
    }

    if (sort === "price-asc") list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    else if (sort === "price-desc") list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    else if (sort === "name") list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

    return list;
  }, [products, type, brand, sort, maxPrice]);

  // Reset visible count when filters or products change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [type, brand, sort, maxPrice, products.length]);

  // IntersectionObserver for lazy loading more products on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filtered.length));
        }
      },
      { rootMargin: "250px" }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel && visibleCount < filtered.length) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [visibleCount, filtered.length]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <section className="w-full">
      {(title || showFilters) && (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && (
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-1 text-sm text-slate-500 sm:text-base">{subtitle}</p>}
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <label className="flex flex-col gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                Type
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-500 sm:px-3 sm:py-2 sm:text-sm sm:min-w-[140px]"
                >
                  {AC_TYPES.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All types" : c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                Brand
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-500 sm:px-3 sm:py-2 sm:text-sm sm:min-w-[140px]"
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b === "all" ? "All brands" : b}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                Max price
                <input
                  type="number"
                  min="0"
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-500 sm:w-28 sm:px-3 sm:py-2 sm:text-sm"
                />
              </label>

              <label className="flex flex-col gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                Sort
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-500 sm:px-3 sm:py-2 sm:text-sm sm:min-w-[140px]"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name A–Z</option>
                </select>
              </label>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse bg-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-slate-500">{emptyMessage}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="py-8 flex justify-center items-center">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <span className="h-4 w-4 rounded-full border-2 border-sky-600 border-t-transparent animate-spin"></span>
                <span>Loading more products...</span>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ProductGrid;
