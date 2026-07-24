import { Link } from "react-router-dom";
import { useGetWishlistQuery, useRemoveWishlistItemMutation, useAddCartItemMutation } from "../../features/api/apiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ProductCard from "../../components/product/ProductCard";

function WishlistPage() {
  const { accessToken } = useSelector((state) => state.ui);
  const { data, isLoading } = useGetWishlistQuery(undefined, { skip: !accessToken });
  const [removeWishlistItem] = useRemoveWishlistItemMutation();
  const [addCartItem, { isLoading: isAdding }] = useAddCartItemMutation();

  if (!accessToken) {
    return (
      <div className="bg-[#eaeded] min-h-screen py-10 px-4">
        <div className="max-w-[1000px] mx-auto bg-white p-6 shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your lists</h2>
          <Link to="/login" className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full py-2 px-6 text-sm font-medium shadow-sm transition-colors">
            Sign in to your account
          </Link>
        </div>
      </div>
    );
  }

  const wishlist = data?.data || data;
  const products = wishlist?.products || [];

  const handleMoveToCart = async (productId) => {
    try {
      await addCartItem({ productId, quantity: 1 }).unwrap();
      await removeWishlistItem(productId).unwrap();
      toast.success("Moved to Cart");
    } catch (err) {
      toast.error("Failed to move item to cart");
    }
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-[1500px] mx-auto px-4">
        <h1 className="text-3xl font-normal text-gray-900 mb-6 border-b border-gray-200 pb-4">Your Lists</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col h-64 bg-gray-100 rounded-md"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-2">You don't have any items in your list yet.</h2>
            <Link to="/shop" className="text-[#007185] hover:text-[#C7511F] hover:underline">Start shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <div key={product._id} className="flex flex-col border border-gray-200 rounded-lg overflow-hidden p-4 group">
                <Link to={`/products/${product.slug || product._id}`} className="block relative aspect-square bg-gray-50 overflow-hidden mb-4">
                  <img src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80"} alt={product.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                </Link>
                <Link to={`/products/${product.slug || product._id}`}>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-[#C7511F] hover:underline">{product.name}</h3>
                </Link>
                <div className="text-lg font-bold text-[#B12704] mt-2 mb-4">${Number(product.price).toFixed(2)}</div>
                
                <div className="mt-auto flex flex-col gap-2">
                  <button 
                    disabled={isAdding}
                    onClick={() => handleMoveToCart(product._id)}
                    className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full py-1.5 px-3 text-sm font-medium shadow-sm transition-colors"
                  >
                    Move to Cart
                  </button>
                  <button 
                    onClick={() => {
                      removeWishlistItem(product._id);
                      toast.info("Removed from list");
                    }}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-300 rounded-full py-1.5 px-3 text-sm shadow-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;