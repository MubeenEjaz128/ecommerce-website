import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation, useAddCartItemMutation } from "../../features/api/apiSlice";
import { setAccessToken } from "../../features/ui/uiSlice";
import { clearGuestCart } from "../../features/cart/guestCartSlice";
import { toast } from "react-toastify";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [addCartItem] = useAddCartItemMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const guestCartItems = useSelector((state) => state.guestCart.items);

  // Try to go back to where the user came from, or home
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password }).unwrap();
      const token = response?.data?.accessToken || response?.accessToken || "";
      dispatch(setAccessToken(token));
      
      // Sync guest cart
      if (guestCartItems && guestCartItems.length > 0) {
        try {
          for (const item of guestCartItems) {
            await addCartItem({ productId: item.product._id, quantity: item.quantity }).unwrap();
          }
          dispatch(clearGuestCart());
        } catch (error) {
          console.error("Failed to sync some guest cart items", error);
        }
      }
      
      toast.success("Signed in successfully!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 border border-gray-300 rounded-lg shadow-sm">
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <span className="text-3xl font-extrabold tracking-tight text-gray-900">
              Cool<span className="text-sky-600"> Breeze</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1" htmlFor="email">Email or mobile phone number</label>
              <input
                id="email"
                type="email"
                required
                className="w-full border border-gray-400 rounded-[3px] px-3 py-1.5 outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="w-full border border-gray-400 rounded-[3px] px-3 py-1.5 outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black border border-[#FCD200] rounded-md py-1.5 px-4 text-sm font-medium shadow-sm transition-colors"
            >
              {isLoading ? "Signing in..." : "Continue"}
            </button>
          </div>
          
          <div className="text-xs text-gray-600 mt-4">
            By continuing, you agree to Cool Breeze&apos;s <Link to="/policies/terms" className="text-sky-700 hover:underline">Conditions of Use</Link> and <Link to="/policies/privacy" className="text-sky-700 hover:underline">Privacy Notice</Link>.
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">New to Cool Breeze?</span>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to="/register"
              className="w-full flex justify-center bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md py-1.5 px-4 text-sm font-medium text-gray-900 shadow-sm transition-colors"
            >
              Create your Cool Breeze account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
