import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGetCategoriesQuery } from "../../features/api/apiSlice";

const fallbackCategories = [
  {
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
  },
  {
    name: "Fashion",
    image: "https://images.pexels.com/photos/5824883/pexels-photo-5824883.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Home & Kitchen",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
  },
  {
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
  },
  {
    name: "Sports",
    image: "https://images.pexels.com/photos/5824883/pexels-photo-5824883.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
  },
];

const imagesByName = Object.fromEntries(fallbackCategories.map((c) => [c.name.toLowerCase(), c.image]));

function CategoriesPage() {
  const { data, isLoading } = useGetCategoriesQuery();
  const apiCategories = data?.data || data?.categories || [];

  const categories =
    apiCategories.length > 0
      ? apiCategories.map((c) => ({
          name: c.name,
          image:
            c.image ||
            imagesByName[c.name?.toLowerCase()] ||
            "https://images.pexels.com/photos/5824883/pexels-photo-5824883.jpeg?auto=compress&cs=tinysrgb&w=800",
        }))
      : fallbackCategories;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
          Categories
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Explore FashionHouse by department and find exactly what you need.
        </p>

        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse bg-stone-200" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group relative block aspect-[4/3] overflow-hidden bg-stone-900"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h2 className="font-display text-2xl font-bold text-white">{cat.name}</h2>
                    <span className="mt-1 inline-block text-sm text-teal-300 opacity-0 transition group-hover:opacity-100">
                      Shop now →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;
