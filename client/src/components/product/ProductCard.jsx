import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAddCartItemMutation } from "../../features/api/apiSlice";
import { addToGuestCart } from "../../features/cart/guestCartSlice";
import { motion } from "framer-motion";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

const AC_FALLBACK =
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=75";

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.ui);
  const [addCartItem, { isLoading }] = useAddCartItemMutation();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!accessToken) {
      dispatch(addToGuestCart({ product, quantity: 1 }));
      toast.success("Added to cart");
      return;
    }

    try {
      await addCartItem({ productId: product._id || product.id, quantity: 1 }).unwrap();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add to cart");
    }
  };

  const rawImage = product.images?.[0]?.url || product.image || AC_FALLBACK;
  const image = getOptimizedImageUrl(rawImage, { width: 400, quality: 75 });
  const price = Number(product.price || product.effectivePrice || 0);
  const href = `/products/${product.slug || product._id || product.id}`;
  const tonnage =
    product.specifications?.tonnage ||
    product.specifications?.Tonnage ||
    product.specifications?.get?.("tonnage");

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden border border-slate-200 bg-white transition-shadow duration-300 hover:shadow-xl"
    >
      <Link to={href} className="relative block aspect-[4/3] overflow-hidden bg-sky-50">
        <img
          src={image}
          alt={product.name}
          width={400}
          height={300}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <Link to={href}>
          <h3 className="line-clamp-2 text-xs font-medium text-slate-900 transition-colors group-hover:text-sky-700 sm:text-base">
            {product.name}
          </h3>
        </Link>
        {tonnage && <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">{tonnage}</p>}

        <p className="mt-1.5 font-display text-sm font-bold text-slate-900 sm:mt-2 sm:text-lg">${price.toFixed(2)}</p>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isLoading}
          className="mt-3 flex w-full items-center justify-center gap-1.5 bg-sky-600 px-2 py-2 text-xs font-semibold text-white transition duration-200 hover:bg-sky-500 disabled:opacity-60 sm:mt-auto sm:px-3 sm:py-2.5 sm:text-sm"
        >
          <ShoppingCart size={14} className="sm:h-4 sm:w-4" />
          {isLoading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </motion.article>
  );
}

export default ProductCard;
