import { useGetProductsQuery, useDeleteProductMutation } from "../../features/api/apiSlice";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, Image as ImageIcon, Package } from "lucide-react";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

function AdminProducts() {
  const { data: response, isLoading, refetch } = useGetProductsQuery();
  const products = response?.data || response?.products || [];
  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async (slug, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(slug).unwrap();
        alert("Product deleted successfully.");
        refetch();
      } catch (err) {
        console.error(err);
        alert(err?.data?.message || "Failed to delete product.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Manage your store's inventory and product details.</p>
        </div>
        <Link 
          to="/admin/products/new" 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-gray-200"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Package size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500 mb-4">You haven't added any products to your store yet.</p>
          <Link to="/admin/products/new" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg inline-block hover:bg-blue-700 transition-colors">
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                          {p.images && p.images[0] ? (
                            <img
                              src={getOptimizedImageUrl(p.images[0].url, { width: 150, quality: 75 })}
                              alt={p.name}
                              width={48}
                              height={48}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="text-gray-400" size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 line-clamp-1">{p.name}</div>
                          <div className="text-sm text-gray-500 font-mono mt-0.5">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">${(p.price || p.defaultPrice || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${p.isActive !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {p.isActive !== false ? "ACTIVE" : "DRAFT"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/admin/products/${p.slug}/edit`} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(p.slug, p.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
