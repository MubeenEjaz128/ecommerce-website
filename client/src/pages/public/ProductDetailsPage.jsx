import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Lock, Heart, User } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetProductQuery,
  useAddCartItemMutation,
  useAddWishlistItemMutation,
  useGetProductsQuery,
} from "../../features/api/apiSlice";
import { addToGuestCart } from "../../features/cart/guestCartSlice";
import ProductCard from "../../components/product/ProductCard";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

const AC_FALLBACK = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=75";

function getSpec(product, keys) {
  const specs = product.specifications;
  if (!specs) return null;
  for (const key of keys) {
    if (typeof specs.get === "function") {
      const v = specs.get(key);
      if (v) return v;
    }
    if (specs[key]) return specs[key];
  }
  return null;
}

function ProductDetailsPage() {
  const { slug, idOrSlug } = useParams();
  const productKey = slug || idOrSlug;
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.ui);

  const { data: productResponse, isLoading } = useGetProductQuery(productKey, { skip: !productKey });
  const product = productResponse?.data || productResponse;
  const { data: relatedProductsData } = useGetProductsQuery(
    `limit=6&category=${typeof product?.category === "string" ? product.category : product?.category?.name || ""}`,
    { skip: !product }
  );

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [titleInput, setTitleInput] = useState("");
  const [commentInput, setCommentInput] = useState("");

  const [addCartItem, { isLoading: isAddingToCart }] = useAddCartItemMutation();
  const [addWishlistItem] = useAddWishlistItemMutation();

  if (isLoading || !product) {
    return (
      <div className="mx-auto flex max-w-7xl animate-pulse flex-col gap-8 p-8 md:flex-row">
        <div className="h-[420px] w-full bg-slate-200 md:w-1/2" />
        <div className="h-[320px] w-full bg-slate-200 md:w-1/2" />
      </div>
    );
  }

  const variants = product.variants || [];
  const selectedVariantObj = variants.find((v) => String(v.id || v._id) === String(selectedVariant));
  const currentPrice = selectedVariantObj
    ? selectedVariantObj.price ?? product.effectivePrice ?? product.price
    : product.effectivePrice ?? product.price;

  const images = product.images?.length > 0 ? product.images : [{ url: AC_FALLBACK }];
  const relatedProducts = relatedProductsData?.data || relatedProductsData?.products || [];

  const tonnage = getSpec(product, ["tonnage", "Tonnage", "BTU", "btu"]);
  const energy = getSpec(product, ["energyRating", "Energy Rating", "energy", "star"]);
  const coverage = getSpec(product, ["coverage", "Coverage Area", "roomSize", "coverageArea"]);

  const handleAddToCart = async () => {
    if (!accessToken) {
      dispatch(addToGuestCart({ product, quantity, variant: selectedVariantObj || null }));
      toast.success("Added to cart");
      return;
    }
    try {
      await addCartItem({
        productId: product.id || product._id,
        variantId: selectedVariant || null,
        quantity,
      }).unwrap();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add to cart");
    }
  };

  const handleAddToWishlist = async () => {
    if (!accessToken) return toast.info("Sign in to save items to your list");
    try {
      await addWishlistItem(product.id || product._id).unwrap();
      toast.success("Added to wishlist");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add to wishlist");
    }
  };

  return (
    <div className="min-h-screen bg-sky-50/40 pb-16">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
        <Link to="/" className="hover:text-sky-700">
          Home
        </Link>
        <span>/</span>
        <Link
          to={`/shop?category=${encodeURIComponent(
            typeof product.category === "string" ? product.category : product.category?.name || ""
          )}`}
          className="hover:text-sky-700"
        >
          {typeof product.category === "string" ? product.category : product.category?.name || "Shop"}
        </Link>
        <span>/</span>
        <span className="truncate text-slate-800">{product.name}</span>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onMouseEnter={() => setActiveImageIndex(idx)}
                onClick={() => setActiveImageIndex(idx)}
                className={`h-16 w-16 shrink-0 overflow-hidden border-2 ${
                  activeImageIndex === idx ? "border-sky-600" : "border-slate-200"
                }`}
              >
                <img
                  src={getOptimizedImageUrl(img.url, { width: 150, quality: 75 })}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
          <div className="aspect-[4/3] flex-1 overflow-hidden bg-white">
            <img
              src={getOptimizedImageUrl(images[activeImageIndex].url, { width: 800, quality: 80 })}
              alt={product.name}
              width={800}
              height={600}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="font-display text-3xl font-extrabold leading-tight text-slate-900">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="flex text-sky-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.floor(product.ratingAvg || product.averageRating || 4.5) ? "currentColor" : "none"}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-slate-500">{product.ratingCount || product.numReviews || 0} reviews</span>
          </div>

          <p className="mt-4 font-display text-3xl font-bold text-slate-900">
            ${Number(currentPrice).toFixed(2)}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SpecBox label="Tonnage / BTU" value={tonnage || "See description"} />
            <SpecBox label="Energy rating" value={energy || "See description"} />
            <SpecBox label="Coverage area" value={coverage || "See description"} />
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-600">
            {product.description || "Reliable cooling performance from Air Covo."}
          </p>

          {variants.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-slate-800">Variant</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVariant(null)}
                  className={`border px-3 py-2 text-sm transition ${
                    !selectedVariant
                      ? "border-sky-600 bg-sky-50 text-sky-800"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  Default
                </button>
                {variants.map((v) => (
                  <button
                    key={v.id || v._id}
                    type="button"
                    onClick={() => setSelectedVariant(v.id || v._id)}
                    className={`border px-3 py-2 text-sm transition ${
                      selectedVariant === (v.id || v._id)
                        ? "border-sky-600 bg-sky-50 text-sky-800"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {[v.size, v.color].filter(Boolean).join(" / ") || v.sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              Qty
              <select
                className="border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-500"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex-1 bg-sky-600 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
            >
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
            <button
              type="button"
              onClick={handleAddToWishlist}
              className="flex items-center justify-center gap-2 border border-slate-300 bg-white px-5 py-3.5 text-sm font-medium transition hover:border-slate-400"
            >
              <Heart size={16} /> Save
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <Lock size={14} />
            Secure checkout · 256-bit SSL
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Related cooling products</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 md:gap-5">
            {relatedProducts.slice(0, 6).map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto mt-16 flex max-w-7xl flex-col gap-10 border-t border-slate-200 px-4 pt-10 sm:px-6 lg:flex-row lg:px-8">
        <div className="w-full shrink-0 lg:w-72">
          <h2 className="font-display text-xl font-bold text-slate-900">Customer reviews</h2>
          {!showReviewForm ? (
            <button
              type="button"
              onClick={() => {
                if (!accessToken) return toast.info("Please sign in to write a review");
                setShowReviewForm(true);
              }}
              className="mt-5 w-full border border-slate-300 bg-white py-2.5 text-sm font-medium transition hover:bg-slate-50"
            >
              Write a review
            </button>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const resp = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                      product: product._id || product.id,
                      rating: ratingInput,
                      title: titleInput,
                      comment: commentInput,
                    }),
                  });
                  if (resp.ok) {
                    toast.success("Review submitted!");
                    setShowReviewForm(false);
                  } else {
                    const err = await resp.json();
                    toast.error(err.message || "Failed to submit review");
                  }
                } catch {
                  toast.error("Failed to submit review");
                }
              }}
              className="mt-4 flex flex-col gap-3"
            >
              <select
                value={ratingInput}
                onChange={(e) => setRatingInput(Number(e.target.value))}
                className="border border-slate-300 px-2 py-2 text-sm"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Stars
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Title"
                required
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="border border-slate-300 px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Your review"
                required
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="h-24 border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-sky-600 py-2 text-sm font-semibold text-white">
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 bg-slate-200 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-slate-900">Top reviews</h3>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mt-6 border-b border-slate-100 pb-6 last:border-0">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                  <User size={16} className="text-slate-500" />
                </div>
                Verified Customer
              </div>
              <div className="mb-2 flex text-sky-500">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} fill={j < 5 - i ? "currentColor" : "none"} strokeWidth={1} />
                ))}
              </div>
              <p className="text-sm text-slate-600">
                Excellent cooling performance and clear product specs. Happy with my Air Covo purchase.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpecBox({ label, value }) {
  return (
    <div className="border border-slate-200 bg-white px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default ProductDetailsPage;
