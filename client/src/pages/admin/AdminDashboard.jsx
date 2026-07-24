import { useGetProductsQuery, useGetAllOrdersQuery, useGetCategoriesQuery, useGetBrandsQuery } from "../../features/api/apiSlice";
import { Package, ShoppingCart, Tags, ListTree, DollarSign, TrendingUp, Store } from "lucide-react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const { data: productsRes } = useGetProductsQuery();
  const products = Array.isArray(productsRes?.data) ? productsRes.data : (productsRes?.data?.items || productsRes?.products || []);
  
  const { data: ordersRes } = useGetAllOrdersQuery({ limit: 100 });
  const orders = Array.isArray(ordersRes?.data) ? ordersRes.data : (ordersRes?.data?.items || []);
  
  const { data: categoriesRes } = useGetCategoriesQuery();
  const categories = Array.isArray(categoriesRes?.data) ? categoriesRes.data : (categoriesRes?.data?.categories || []);
  
  const { data: brandsRes } = useGetBrandsQuery();
  const brands = Array.isArray(brandsRes?.data) ? brandsRes.data : (brandsRes?.data?.brands || []);

  const totalRevenue = orders
    .filter(o => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0);

  const stats = [
    { name: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: <DollarSign size={24} className="text-white" />, color: "bg-emerald-500" },
    { name: "Total Orders", value: orders.length, icon: <ShoppingCart size={24} className="text-white" />, color: "bg-blue-500" },
    { name: "Total Products", value: products.length, icon: <Package size={24} className="text-white" />, color: "bg-purple-500" },
    { name: "Categories", value: categories.length, icon: <ListTree size={24} className="text-white" />, color: "bg-orange-500" },
    { name: "Brands", value: brands.length, icon: <Tags size={24} className="text-white" />, color: "bg-pink-500" },
    { name: "Growth", value: "+12.5%", icon: <TrendingUp size={24} className="text-white" />, color: "bg-indigo-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <TrendingUp size={200} className="-mr-10 -mt-10" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Dashboard Overview</h1>
          <p className="text-blue-100 max-w-xl text-lg">Welcome back! Here is a summary of what's happening with your store today. Keep up the great work.</p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link to="/admin/products/new" className="px-6 py-3 bg-white text-blue-900 font-bold rounded-xl shadow-md hover:bg-gray-100 transition-all flex items-center gap-2">
            <Package size={20} />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className={`absolute -right-6 -bottom-6 opacity-5 transition-transform group-hover:scale-125 duration-500`}>
              {stat.icon}
            </div>
            <div className={`w-14 h-14 rounded-xl ${stat.color} flex items-center justify-center shrink-0 shadow-inner`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider">{stat.name}</div>
              <div className="text-2xl font-black text-gray-900 mt-1">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-xl font-extrabold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View All <TrendingUp size={16} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 5).map(o => (
              <div key={o._id} className="p-5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                <div>
                  <div className="font-bold text-gray-900 text-lg">{o.orderNumber}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString()} • {new Date(o.createdAt).toLocaleTimeString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-gray-900 text-lg">${(o.totalAmount || o.total || 0).toFixed(2)}</div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full inline-block mt-1 uppercase tracking-wider
                    ${o.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                      o.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                      o.status === "delivered" ? "bg-emerald-100 text-emerald-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                    {o.status}
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="p-8 text-center text-gray-500 italic">No recent orders found.</div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-100 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl -ml-10 -mb-10 opacity-60"></div>
          
          <div className="w-20 h-20 bg-white shadow-md text-blue-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 rotate-3">
            <Store size={40} />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2 relative z-10">Manage Store</h3>
          <p className="text-gray-500 mb-8 relative z-10 font-medium">Keep your inventory updated to attract more sales.</p>
          <div className="w-full space-y-3 relative z-10">
            <Link to="/admin/products" className="flex items-center justify-between w-full p-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl shadow-sm border border-gray-100 transition-all group">
              <span className="flex items-center gap-3"><Package size={18} className="text-blue-500"/> Products</span>
              <span className="text-gray-300 group-hover:text-blue-500 transition-colors">→</span>
            </Link>
            <Link to="/admin/brands" className="flex items-center justify-between w-full p-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl shadow-sm border border-gray-100 transition-all group">
              <span className="flex items-center gap-3"><Tags size={18} className="text-purple-500"/> Brands</span>
              <span className="text-gray-300 group-hover:text-purple-500 transition-colors">→</span>
            </Link>
            <Link to="/admin/categories" className="flex items-center justify-between w-full p-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl shadow-sm border border-gray-100 transition-all group">
              <span className="flex items-center gap-3"><ListTree size={18} className="text-orange-500"/> Categories</span>
              <span className="text-gray-300 group-hover:text-orange-500 transition-colors">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
