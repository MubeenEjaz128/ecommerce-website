import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../features/api/apiSlice";
import { setAccessToken } from "../../features/ui/uiSlice";
import { Lock, Mail, ShieldAlert } from "lucide-react";

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userData = await login({ email, password }).unwrap();
      const user = userData?.data?.user || userData?.user;
      
      if (user?.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      const token = userData?.data?.accessToken || userData?.accessToken || "";
      dispatch(setAccessToken(token));
      navigate("/admin");
    } catch (err) {
      setError(err?.message || err?.data?.message || "Invalid credentials or unauthorized.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
        <div className="p-8 text-center bg-gray-900 border-b border-gray-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/50 text-blue-500 mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Air Covo Admin</h2>
          <p className="text-gray-400 mt-2 text-sm">Secure access for authorized personnel only.</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-md flex items-start gap-3">
              <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Authenticating..." : "Sign in to Dashboard"}
            </button>
          </form>
        </div>
        
        <div className="px-8 py-4 bg-gray-900 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Air Covo Admin
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
