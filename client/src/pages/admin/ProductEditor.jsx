import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SectionHeading from "../../components/ui/SectionHeading";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadFileMutation,
  useDeleteUploadMutation,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
} from "../../features/api/apiSlice";

function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: productResp } = useGetProductQuery(id, { skip: !id });
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [deleteUpload] = useDeleteUploadMutation();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    brand: "",
    category: "",
    images: [],
    variants: [],
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isPopulated, setIsPopulated] = useState(false);
  const { data: bRes } = useGetBrandsQuery();
  const { data: cRes } = useGetCategoriesQuery();
  const brands = bRes?.data || bRes?.brands || [];
  const categories = cRes?.data || cRes?.categories || [];

  // populate when editing
  const product = productResp?.data || productResp?.product;
  if (product && !isPopulated) {
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      brand: product.brand?.id || product.brand?._id || product.brandId || product.brand || "",
      category: product.category?.id || product.category?._id || product.categoryId || product.category || "",
      images: product.images || [],
      variants: product.variants || [],
    });
    setIsPopulated(true);
  }

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setErrorMsg("");
    const fd = new FormData();
    files.forEach((file) => {
      fd.append("file", file);
    });

    try {
      const res = await uploadFile(fd).unwrap();
      const data = res?.data || res;
      const uploadedArr = Array.isArray(data) ? data : [data];

      setForm((s) => {
        const newImgs = uploadedArr.map((uploaded) => ({
          url: uploaded.url,
          publicId: uploaded.publicId,
          isPrimary: false,
        }));
        const imgs = [...(s.images || []), ...newImgs];
        if (!imgs.some((i) => i.isPrimary) && imgs.length) {
          imgs[0].isPrimary = true;
        }
        return { ...s, images: imgs };
      });
    } catch (err) {
      console.error("Image upload error:", err);
      const msg = err?.data?.message || err?.data?.details || "Image upload failed. Please try again.";
      setErrorMsg(msg);
      alert(msg);
    }
  };

  const handleDeleteImage = async (publicId) => {
    try {
      if (publicId) {
        await deleteUpload(publicId).unwrap();
      }
      setForm((s) => {
        const imgs = (s.images || []).filter((img) => img.publicId !== publicId);
        if (imgs.length && !imgs.some((i) => i.isPrimary)) imgs[0].isPrimary = true;
        return { ...s, images: imgs };
      });
    } catch (err) {
      console.error("Failed to delete image", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.name.trim()) return alert("Product Name is required");
    if (!form.description.trim()) return alert("Product Description is required");
    if (!form.brand) return alert("Brand is required");
    if (!form.category) return alert("Category is required");
    if (form.price === "" || form.price < 0) return alert("Valid Base Price is required");

    const payload = {
      ...form,
      brandId: form.brand,
      categoryId: form.category,
    };

    if (!payload.images?.length) {
      payload.images = [
        {
          url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
          publicId: "",
          alt: payload.name,
          isPrimary: true,
        },
      ];
    }

    try {
      if (id) {
        await updateProduct({ id, ...payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      alert("Product saved successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Save product error:", err);
      const msg =
        err?.data?.message ||
        (Array.isArray(err?.data?.errors) ? err.data.errors.map((e) => e.msg).join(", ") : null) ||
        err?.data?.details ||
        err?.error ||
        "Failed to save product. Check required fields.";
      setErrorMsg(msg);
      alert(`Save Failed: ${msg}`);
    }
  };

  return (
    <div>
      <SectionHeading>{id ? "Edit Product" : "Create Product"}</SectionHeading>

      {errorMsg && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Air Covo Pro Split AC 1.5 Ton"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the product..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm h-32"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Base Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-1">
              Brand <span className="text-red-500">*</span>
            </span>
            <select
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            >
              <option value="">Select brand</option>
              {brands.map((b) => (
                <option key={b.id || b._id} value={b.id || b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <span className="block text-sm font-semibold text-gray-700 mb-2">
            Product Images <span className="text-red-500">*</span>
          </span>
          <div className="flex gap-2 items-center">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors text-sm">
              Choose files
              <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
            </label>
            <span className="text-xs text-gray-500">
              {isUploading ? "Uploading images..." : "Supported formats: PNG, JPG, WEBP, GIF, SVG, AVIF"}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {(form.images || []).map((img, idx) => (
              <div key={idx} className="relative group border rounded-lg p-1 bg-white shadow-sm">
                <img src={img.url} alt="" className="w-24 h-24 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.publicId)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Variants / SKUs</h3>
          <div className="space-y-3">
            {(form.variants || []).length > 0 && (
              <div className="grid grid-cols-[1fr_1fr_1.5fr_1fr_1.5fr] gap-2 px-1 hidden md:grid">
                <span className="text-xs font-semibold text-gray-600 uppercase">Size</span>
                <span className="text-xs font-semibold text-gray-600 uppercase">Color</span>
                <span className="text-xs font-semibold text-gray-600 uppercase">SKU (Unique)</span>
                <span className="text-xs font-semibold text-gray-600 uppercase">Extra Price ($)</span>
                <span className="text-xs font-semibold text-gray-600 uppercase">Stock Count & Actions</span>
              </div>
            )}
            {(form.variants || []).map((v, idx) => (
              <div
                key={v._id || idx}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.5fr_1fr_1.5fr] gap-2 items-end bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
              >
                <input
                  value={v.size || ""}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      variants: s.variants.map((vv, i) => (i === idx ? { ...vv, size: e.target.value } : vv)),
                    }))
                  }
                  placeholder="Size"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
                <input
                  value={v.color || ""}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      variants: s.variants.map((vv, i) => (i === idx ? { ...vv, color: e.target.value } : vv)),
                    }))
                  }
                  placeholder="Color"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
                <input
                  value={v.sku || ""}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      variants: s.variants.map((vv, i) => (i === idx ? { ...vv, sku: e.target.value } : vv)),
                    }))
                  }
                  placeholder="SKU"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
                <input
                  type="number"
                  value={v.price ?? 0}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      variants: s.variants.map((vv, i) =>
                        i === idx ? { ...vv, price: Number(e.target.value) } : vv,
                      ),
                    }))
                  }
                  placeholder="Price"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={v.stock ?? 0}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        variants: s.variants.map((vv, i) =>
                          i === idx ? { ...vv, stock: Number(e.target.value) } : vv,
                        ),
                      }))
                    }
                    placeholder="Stock"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((s) => ({ ...s, variants: s.variants.filter((_, i) => i !== idx) }))
                    }
                    className="rounded-lg bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 text-sm font-bold transition-colors shadow-sm flex items-center justify-center cursor-pointer border border-red-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  setForm((s) => ({
                    ...s,
                    variants: [
                      ...(s.variants || []),
                      { size: "", color: "", sku: `SKU-${Date.now()}`, price: s.price || 0, stock: 0 },
                    ],
                  }))
                }
                className="rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-6 py-2.5 text-sm font-bold hover:bg-blue-100 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
              >
                + Add Variant
              </button>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button className="rounded-lg bg-blue-600 px-8 py-3 text-base font-bold text-white hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center w-full md:w-48 cursor-pointer">
            {id ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductEditor;
