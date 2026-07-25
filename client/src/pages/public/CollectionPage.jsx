import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../../components/product/ProductCard";
import { useGetProductsQuery } from "../../features/api/apiSlice";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

function CollectionPage() {
  const { data, isLoading } = useGetProductsQuery("limit=16");
  const products = data?.data || data?.products || [];

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative h-[42vh] min-h-[320px] w-full overflow-hidden bg-stone-900">
        <img
          src={getOptimizedImageUrl("https://images.unsplash.com/photo-1584622650111-993a426fbf0a", { width: 1200, quality: 75 })}
          alt="Collection Header"
          width={1200}
          height={400}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <p className="font-display text-lg font-bold text-teal-300">FashionHouse</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-white sm:text-5xl">Collection</h1>
            <p className="mt-3 max-w-lg text-stone-300">
              A curated edit of seasonal favorites and signature pieces.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse bg-stone-200" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-stone-500">No products in this collection yet.</p>
            <Link to="/shop" className="mt-4 inline-block font-semibold text-teal-700 hover:underline">
              Browse shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product._id || product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectionPage;
