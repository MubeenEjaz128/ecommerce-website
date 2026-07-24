import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useRegisterMutation, useAddCartItemMutation } from "../../features/api/apiSlice";
import { setAccessToken } from "../../features/ui/uiSlice";
import { clearGuestCart } from "../../features/cart/guestCartSlice";
import { toast } from "react-toastify";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [register, { isLoading }] = useRegisterMutation();
  const [addCartItem] = useAddCartItemMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const guestCartItems = useSelector((state) => state.guestCart.items);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    try {
      const response = await register({ name, email, password, confirmPassword }).unwrap();
      const token = response?.data?.accessToken || response?.accessToken || "";
      dispatch(setAccessToken(token));
      
      // Sync guest cart
      if (guestCartItems && guestCartItems.length > 0) {
        try {
          for (const item of guestCartItems) {
            await addCartItem({ productId: item.product.id || item.product._id, quantity: item.quantity }).unwrap();
          }
          dispatch(clearGuestCart());
        } catch (error) {
          console.error("Failed to sync some guest cart items", error);
        }
      }
      
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.details?.[0]?.msg || err?.data?.message || "Registration failed. Please try again.");
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
          <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1" htmlFor="name">Your name</label>
            <input
              id="name"
              type="text"
              required
              className="w-full border border-gray-400 rounded-[3px] px-3 py-1.5 outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First and last name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1" htmlFor="email">Email</label>
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
              minLength="8"
              className="w-full border border-gray-400 rounded-[3px] px-3 py-1.5 outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <div className="text-xs text-gray-500 mt-1">
              <i>i</i> Passwords must be at least 8 characters long, include 1 uppercase, 1 lowercase, and 1 number.
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1" htmlFor="confirmPassword">Re-enter password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              className="w-full border border-gray-400 rounded-[3px] px-3 py-1.5 outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black border border-[#FCD200] rounded-md py-1.5 px-4 text-sm font-medium shadow-sm transition-colors"
            >
              {isLoading ? "Creating account..." : "Continue"}
            </button>
          </div>
          
          <div className="text-xs text-gray-600 mt-4 border-b border-gray-200 pb-6">
            By creating an account, you agree to Cool Breeze&apos;s <Link to="/policies/terms" className="text-sky-700 hover:underline">Conditions of Use</Link> and <Link to="/policies/privacy" className="text-sky-700 hover:underline">Privacy Notice</Link>.
          </div>

          <div className="pt-4 text-sm text-gray-900">
            Already have an account? <Link to="/login" className="text-blue-600 hover:text-[#C7511F] hover:underline flex items-center gap-1 inline-flex">Sign in <span className="text-xs">▶</span></Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
