import { useState } from "react";
import SectionHeading from "../../components/ui/SectionHeading";
import { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation } from "../../features/api/apiSlice";

export default function CategoriesPage() {
  const { data: response, isLoading, refetch } = useGetCategoriesQuery();
  const categories = response?.data || response?.categories || [];
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [name, setName] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory({ name }).unwrap();
      setName("");
      alert("Category added successfully!");
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Failed to add category");
    }
  };

  const handleDelete = async (c) => {
    if (window.confirm(`Are you sure you want to delete ${c.name}?`)) {
      try {
        await deleteCategory(c.slug).unwrap();
        alert("Category deleted!");
      } catch (err) {
        console.error(err);
        alert(err?.data?.message || "Failed to delete category");
      }
    }
  };

  return (
    <div className="max-w-4xl">
      <SectionHeading>Categories</SectionHeading>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Add New Category</h3>
        <form onSubmit={handleCreate} className="flex flex-col gap-2 max-w-md">
          <label className="text-sm font-semibold text-gray-700">Category Name <span className="text-red-500">*</span></label>
          <div className="flex gap-3">
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Electronics, Clothing..." 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400" 
              disabled={isCreating}
            />
            <button 
              type="submit" 
              className={`px-6 py-2 font-semibold rounded-lg transition-all ${isCreating || !name.trim() ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"}`}
              disabled={isCreating || !name.trim()}
            >
              {isCreating ? "Adding..." : "Add Category"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">All Categories</h3>
        {isLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-gray-500 italic">No categories found. Create one above.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {categories.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-bold text-gray-900">{c.name}</div>
                  <div className="text-sm text-gray-500 font-mono mt-1">{c.slug}</div>
                </div>
                <div>
                  <button 
                    className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100" 
                    onClick={() => handleDelete(c)}
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
