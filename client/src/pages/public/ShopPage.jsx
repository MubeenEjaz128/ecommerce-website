import { useSearchParams } from "react-router-dom";
import ProductGrid from "../../components/product/ProductGrid";
import { useGetProductsQuery } from "../../features/api/apiSlice";

function ShopPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "";
  const onSale = searchParams.get("onSale") || "";

  let query = "limit=48&isActive=true&";
  if (categoryParam) query += `category=${encodeURIComponent(categoryParam)}&`;
  if (searchParam) query += `search=${encodeURIComponent(searchParam)}&`;
  if (onSale === "true") query += "onSale=true&";
  if (sortParam === "new") query += "sort=-createdAt&";
  if (sortParam === "best" || sortParam === "trending") query += "isBestSeller=true&";

  const { data: productsData, isLoading } = useGetProductsQuery(query);
  const products = productsData?.data || productsData?.products || [];

  return (
    <div className="min-h-screen bg-sky-50/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">Cooling Shop</h1>
        <p className="mt-2 text-slate-500">
          {searchParam
            ? `Results for “${searchParam}”`
            : categoryParam
              ? `Browsing ${categoryParam}`
              : "Split, window, portable ACs, coolers, and more"}
        </p>

        <div className="mt-10">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            showFilters
            emptyMessage="No cooling products match your filters."
          />
        </div>
      </div>
    </div>
  );
}

export default ShopPage;
