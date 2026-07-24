import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useLogoutMutation } from "../../features/api/apiSlice";

function DashboardLayout() {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 rounded-md border border-border bg-surface p-4 flex flex-col justify-between">
          <nav className="flex flex-col gap-2">
            <NavLink to="/account" end className={({ isActive }) => (isActive ? "font-semibold text-accent" : "text-text/80")}>
              Dashboard
            </NavLink>
            <NavLink to="/account/profile" className={({ isActive }) => (isActive ? "font-semibold text-accent" : "text-text/80")}>
              Profile
            </NavLink>
            <NavLink to="/account/addresses" className={({ isActive }) => (isActive ? "font-semibold text-accent" : "text-text/80")}>
              Addresses
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => (isActive ? "font-semibold text-accent" : "text-text/80")}>
              Orders
            </NavLink>
          </nav>
          
          <button 
            onClick={handleLogout}
            className="mt-8 flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-2 py-2 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
