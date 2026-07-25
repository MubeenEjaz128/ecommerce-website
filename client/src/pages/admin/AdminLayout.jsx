import { Outlet, NavLink, useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { setAccessToken } from "../../features/ui/uiSlice";
import { LogOut, LayoutDashboard, Package, ShoppingCart, Tags, ListTree, Store, Bell, User, Menu, X } from "lucide-react";
import { toast } from "react-toastify";

function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken } = useSelector((state) => state.ui);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If not authenticated, redirect to admin login
  if (!accessToken) {
    return <Navigate to="/admin/login" replace />;
  }

  let isAdmin = false;
  try {
    const base64Url = accessToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    isAdmin = payload.role === "admin";
  } catch (e) {
    isAdmin = false;
  }

  if (!isAdmin) {
    // If a regular customer tries to access admin, redirect to public home
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    dispatch(setAccessToken(""));
    navigate("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} />, exact: true },
    { name: "Products", path: "/admin/products", icon: <Package size={20} /> },
    { name: "Orders", path: "/admin/orders", icon: <ShoppingCart size={20} /> },
    { name: "Brands", path: "/admin/brands", icon: <Tags size={20} /> },
    { name: "Categories", path: "/admin/categories", icon: <ListTree size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-gray-900 text-white h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-1 text-gray-300 hover:text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <Store className="text-blue-500" size={24} />
            <span className="font-bold text-xl tracking-wide hidden sm:block">Cool Breeze <span className="text-blue-500 font-normal">Admin</span></span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            className="text-gray-300 hover:text-white relative"
            onClick={() => toast.info("No new notifications")}
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-gray-900"></span>
          </button>
          <div className="flex items-center gap-2 border-l border-gray-700 pl-6 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
              <User size={16} />
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white">Administrator</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col absolute md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}`}>
          <div className="p-4 flex-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Management</div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 min-w-0 overflow-x-hidden overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
