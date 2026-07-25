import { Link } from "react-router-dom";
import Hero from "../../components/home/Hero";
import Testimonials from "../../components/home/Testimonials";
import PartnerLogos from "../../components/home/PartnerLogos";
import ProductSlider from "../../components/product/ProductSlider";
import ProductGrid from "../../components/product/ProductGrid";
import { useGetProductsQuery } from "../../features/api/apiSlice";
import { motion } from "framer-motion";

function HomePage() {
  const { data: latestData, isLoading: loadingLatest } = useGetProductsQuery(
    "limit=16&sort=-createdAt&isActive=true"
  );
  const { data: hotData, isLoading: loadingHot } = useGetProductsQuery(
    "limit=16&isBestSeller=true&isActive=true"
  );
  const { data: allData, isLoading: loadingAll } = useGetProductsQuery("limit=24&isActive=true");

  const latest = latestData?.data || latestData?.products || [];
  const hot = hotData?.data || hotData?.products || [];
  const allProducts = allData?.data || allData?.products || [];

  const newArrivals = (latest.length ? latest : allProducts).slice(0, 8);
  const hotSelling = (hot.length ? hot : [...allProducts].reverse()).slice(0, 8);

  return (
    <div className="w-full max-w-full overflow-hidden bg-sky-50/60">
      <Hero />

      <div className="mx-auto max-w-7xl space-y-12 px-3 py-10 sm:px-6 sm:py-16 sm:space-y-20 lg:px-8 lg:space-y-24 lg:py-20">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                New Arrivals
              </h2>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Latest ACs and cooling appliances just added
              </p>
            </div>
            <Link to="/shop" className="hidden text-sm font-semibold text-sky-700 transition hover:text-sky-600 sm:block">
              View all →
            </Link>
          </div>
          <ProductSlider products={newArrivals} isLoading={loadingLatest} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Hot Selling Products
              </h2>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Best-selling coolers and air conditioners
              </p>
            </div>
            <Link to="/shop" className="hidden text-sm font-semibold text-sky-700 transition hover:text-sky-600 sm:block">
              View all →
            </Link>
          </div>
          <ProductSlider products={hotSelling} isLoading={loadingHot} />
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <ProductGrid
            title="All Products"
            subtitle="Filter by AC type, brand, and price"
            products={allProducts}
            isLoading={loadingAll}
            showFilters
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Testimonials />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <PartnerLogos />
        </motion.div>
      </div>
    </div>
  );
}

export default HomePage;
