import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} from "../../features/api/apiSlice";
import { useDispatch, useSelector } from "react-redux";
import { updateGuestCartItem, removeFromGuestCart } from "../../features/cart/guestCartSlice";
import { Minus, Plus, Trash2 } from "lucide-react";
import { VisaLogo, MastercardLogo, AmexLogo, DiscoverLogo } from "../../components/ui/CardLogos";

function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.ui);
  const guestCartItems = useSelector((state) => state.guestCart.items);

  const { data, isLoading } = useGetCartQuery(undefined, { skip: !accessToken });
  const [updateCartItemMut] = useUpdateCartItemMutation();
  const [removeCartItemMut] = useRemoveCartItemMutation();

  const handleUpdateItem = (itemId, updates) => {
    if (accessToken) {
      updateCartItemMut({ itemId, ...updates });
    } else {
      dispatch(updateGuestCartItem({ itemId, ...updates }));
    }
  };

  const handleRemoveItem = (itemId) => {
    if (accessToken) {
      removeCartItemMut(itemId);
    } else {
      dispatch(removeFromGuestCart(itemId));
    }
  };

  const cartItems = accessToken ? data?.data?.items || data?.items || [] : guestCartItems;
  const activeItems = cartItems?.filter((i) => !i.saveForLater) || [];

  const totals = useMemo(() => {
    let subtotal = 0;
    activeItems.forEach((item) => {
      subtotal += item.price * item.quantity;
    });
    return {
      subtotal,
      count: activeItems.reduce((acc, curr) => acc + curr.quantity, 0),
    };
  }, [activeItems]);

  const handleCheckout = () => {
    // Guest checkout allowed — login optional
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-display text-3xl font-extrabold text-stone-900">Your Cart</h1>
        <p className="mt-1 text-stone-500">Review items and proceed when you&apos;re ready.</p>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 border border-stone-200 bg-white">
            {isLoading && accessToken ? (
              <div className="space-y-4 p-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-28 w-28 bg-stone-200" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-3/4 bg-stone-200" />
                      <div className="h-4 w-1/4 bg-stone-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeItems.length === 0 ? (
              <div className="p-10 text-center">
                <h2 className="font-display text-xl font-bold text-stone-900">Your cart is empty</h2>
                <p className="mt-2 text-sm text-stone-500">
                  Browse the shop and add something you love.
                </p>
                <Link
                  to="/shop"
                  className="mt-6 inline-block bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-500"
                >
                  Continue shopping
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-stone-200">
                {activeItems.map((item) => (
                  <li key={item.id || item._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <Link
                      to={`/products/${item.product?.slug || item.product?.id}`}
                      className="h-28 w-28 shrink-0 overflow-hidden bg-stone-100"
                    >
                      <img
                        src={
                          item.product?.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80"
                        }
                        alt={item.product?.name || "Product"}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col gap-2">
                      <Link
                        to={`/products/${item.product?.slug || item.product?.id}`}
                        className="font-medium text-stone-900 transition hover:text-teal-700"
                      >
                        {item.product?.name}
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-stone-500">
                          {[item.variant?.size, item.variant?.color].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <p className="font-display text-lg font-bold text-stone-900">
                        ${Number(item.price * item.quantity).toFixed(2)}
                      </p>

                      <div className="mt-1 flex items-center gap-3">
                        <div className="flex items-center border border-stone-300">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            className="p-2 text-stone-600 transition hover:bg-stone-50"
                            onClick={() =>
                              handleUpdateItem(item.id || item._id, {
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            }
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            className="p-2 text-stone-600 transition hover:bg-stone-50"
                            onClick={() =>
                              handleUpdateItem(item.id || item._id, { quantity: item.quantity + 1 })
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id || item._id)}
                          className="flex items-center gap-1 text-sm text-stone-500 transition hover:text-red-600"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {activeItems.length > 0 && (
          <aside className="h-fit w-full shrink-0 border border-stone-200 bg-white p-6 lg:w-80">
              <h2 className="font-display text-lg font-bold text-stone-900">Order summary</h2>
              <div className="mt-4 flex justify-between text-sm text-stone-600">
                <span>Subtotal ({totals.count} items)</span>
                <span className="font-semibold text-stone-900">${totals.subtotal.toFixed(2)}</span>
              </div>
              <p className="mt-2 text-xs text-stone-400">Taxes calculated at checkout.</p>
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-6 w-full bg-teal-600 py-3 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                Checkout
              </button>
              <Link
                to="/shop"
                className="mt-3 block text-center text-sm font-medium text-teal-700 hover:underline"
              >
                Continue shopping
              </Link>

              {/* Payment Security Badges - Coded (no PayPal) */}
              <div className="mt-6 border border-stone-200 rounded-lg p-4 bg-stone-50">
                {/* Top row: Secure badges */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                    </div>
                    <span className="text-[9px] font-bold text-stone-600 text-center leading-tight">SECURE<br/>CHECKOUT</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <span className="text-[9px] font-bold text-stone-600 text-center leading-tight">SSL SECURE<br/>AES 256-BIT</span>
                  </div>
                </div>
                <p className="text-center text-[11px] font-bold text-stone-800 mb-3">Safe and Secure SSL Encrypted</p>
                {/* Card brand logos — original proper logos */}
                <div className="flex items-center justify-center gap-2">
                  <VisaLogo width={48} height={30} />
                  <MastercardLogo width={48} height={30} />
                  <AmexLogo width={48} height={30} />
                  <DiscoverLogo width={48} height={30} />
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartPage;
