import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";
import { useGetProductsQuery } from "../../features/api/apiSlice";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";

function DealsPage() {
  const { data: productsData, isLoading } = useGetProductsQuery("limit=12");
  const products = productsData?.data || productsData?.products || [];
  
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") return products;
    if (activeFilter === "available") return products.filter((_, i) => i % 3 !== 0); // Mock available
    if (activeFilter === "upcoming") return products.filter((_, i) => i % 3 === 0); // Mock upcoming
    return products;
  }, [products, activeFilter]);

  return (
    <div className="bg-[#eaeded] min-h-screen pb-12">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1500px] mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Tag className="text-[#CC0C39]" size={32} /> Today's Deals
              </h1>
              <p className="text-gray-600 mt-2">New deals. Every day. Shop our Deal of the Day, Lightning Deals and more daily deals and limited-time sales.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveFilter("all")}
                className={`text-sm font-bold px-3 py-1 rounded-full transition-colors ${activeFilter === "all" ? "bg-gray-800 text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              >
                All Deals
              </button>
              <button 
                onClick={() => setActiveFilter("available")}
                className={`text-sm font-bold px-3 py-1 rounded-full transition-colors ${activeFilter === "available" ? "bg-gray-800 text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              >
                Available
              </button>
              <button 
                onClick={() => setActiveFilter("upcoming")}
                className={`text-sm font-bold px-3 py-1 rounded-full transition-colors ${activeFilter === "upcoming" ? "bg-gray-800 text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              >
                Upcoming
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 mt-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {isLoading ? (
            // Loading skeletons
            [...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="bg-gray-200 aspect-square w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))
          ) : (
            filteredProducts.map((product) => (
              <div key={product._id || product.id} className="relative group">
                <div className="absolute top-2 left-2 z-10 bg-[#CC0C39] text-white text-xs font-bold px-2 py-1 rounded-sm shadow-sm flex items-center gap-1">
                  Up to 50% off
                </div>
                <ProductCard product={product} />
              </div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default DealsPage;
