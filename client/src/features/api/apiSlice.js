import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { refreshToken } from "../../utils/auth";
import { setAccessToken } from "../ui/uiSlice";
import { toast } from "react-toastify";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().ui.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Track if we're already logging out to avoid duplicate toasts
let isLoggingOut = false;

const isJwtExpiredError = (result) => {
  if (!result?.error) return false;
  const status = result.error.status;
  const msg = (
    result.error.data?.message ||
    result.error.data?.error ||
    ""
  ).toLowerCase();
  // Catch 401 OR 500 with 'jwt' in message (server bug returning 500 for expired token)
  return status === 401 || (status === 500 && (msg.includes("jwt") || msg.includes("token")));
};

const forceLogout = (dispatch) => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  dispatch(setAccessToken(""));
  toast.error("Session expired — please log in again.", {
    toastId: "session-expired", // prevent duplicates
    onClose: () => { isLoggingOut = false; },
  });
  // Redirect to login after short delay
  setTimeout(() => {
    window.location.href = "/login";
    isLoggingOut = false;
  }, 2000);
};

const baseQueryWithRefresh = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (isJwtExpiredError(result)) {
    // Try to refresh the token silently
    const refreshed = await refreshToken(api.dispatch, api.getState);
    if (refreshed?.accessToken) {
      // Token refreshed — retry the original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh also failed → session is truly expired, force logout
      forceLogout(api.dispatch);
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["Products", "Auth", "Cart", "Wishlist", "Orders", "Brands", "Categories", "Addresses", "CardVerifications"],
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),
    addCartItem: builder.mutation({
      query: (body) => ({
        url: "/cart/items",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation({
      query: ({ itemId, ...body }) => ({
        url: `/cart/items/${itemId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: builder.mutation({
      query: (itemId) => ({
        url: `/cart/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: "/cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
    applyCoupon: builder.mutation({
      query: (code) => ({
        url: "/cart/coupon",
        method: "PATCH",
        body: { code },
      }),
      invalidatesTags: ["Cart"],
    }),
    getWishlist: builder.query({
      query: () => "/wishlist",
      providesTags: ["Wishlist"],
    }),
    addWishlistItem: builder.mutation({
      query: (productId) => ({
        url: "/wishlist/items",
        method: "POST",
        body: { productId },
      }),
      invalidatesTags: ["Wishlist"],
    }),
    removeWishlistItem: builder.mutation({
      query: (productId) => ({
        url: `/wishlist/items/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
    getOrders: builder.query({
      query: () => "/orders",
      providesTags: ["Orders"],
    }),
    // Products (public + admin)
    getProducts: builder.query({
      query: (params = "") => `/products${typeof params === 'string' && params ? `?${params}` : ''}`,
      providesTags: (result) =>
        result?.data ? [...result.data.map((p) => ({ type: "Products", id: p._id })), { type: "Products", id: "LIST" }] : [{ type: "Products", id: "LIST" }],
      keepUnusedDataFor: 30,
    }),
    getProduct: builder.query({
      query: (idOrSlug) => `/products/${idOrSlug}`,
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Products", id }],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
    }),
    // Admin: all orders
    getAllOrders: builder.query({
      query: (params = {}) => {
        if (!params || typeof params !== "object") return "/orders/all";
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (typeof v !== "undefined" && v !== null && v !== "") qs.set(k, String(v));
        });
        const q = qs.toString();
        return `/orders/all${q ? `?${q}` : ""}`;
      },
      providesTags: ["Orders"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: "PATCH", body }),
      invalidatesTags: ["Orders"],
    }),
    refundOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}/refund`, method: "POST" }),
      invalidatesTags: ["Orders"],
    }),
    createOrder: builder.mutation({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders", "Cart"],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Orders"],
    }),
    // Addresses
    getAddresses: builder.query({
      query: () => "/addresses",
      providesTags: ["Addresses"],
    }),

    // Categories & Brands
    getCategories: builder.query({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),
    getBrands: builder.query({
      query: () => "/brands",
      providesTags: ["Brands"],
    }),
    createCategory: builder.mutation({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation({
      query: ({ slug, ...body }) => ({ url: `/categories/${slug}`, method: "PATCH", body }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation({
      query: (slug) => ({ url: `/categories/${encodeURIComponent(slug)}`, method: "DELETE" }),
      invalidatesTags: ["Categories"],
    }),
    createBrand: builder.mutation({
      query: (body) => ({ url: "/brands", method: "POST", body }),
      invalidatesTags: ["Brands"],
    }),
    updateBrand: builder.mutation({
      query: ({ slug, ...body }) => ({ url: `/brands/${slug}`, method: "PATCH", body }),
      invalidatesTags: ["Brands"],
    }),
    deleteBrand: builder.mutation({
      query: (slug) => ({ url: `/brands/${encodeURIComponent(slug)}`, method: "DELETE" }),
      invalidatesTags: ["Brands"],
    }),
    createAddress: builder.mutation({
      query: (body) => ({
        url: "/addresses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Addresses"],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/addresses/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Addresses"],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Addresses"],
    }),
    uploadFile: builder.mutation({
      query: (file) => ({
        url: "/uploads",
        method: "POST",
        body: file,
      }),
      invalidatesTags: [],
    }),
    deleteUpload: builder.mutation({
      query: (publicId) => ({
        url: `/uploads/${encodeURIComponent(publicId)}`,
        method: "DELETE",
      }),
      invalidatesTags: [],
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(apiSlice.util.resetApiState());
        } catch (err) {
          // ignore error
        }
      },
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth"],
    }),
    // Card Verification endpoints
    submitCardVerification: builder.mutation({
      query: (body) => ({
        url: "/card-verifications/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CardVerifications"],
    }),
    getVerificationStatus: builder.query({
      query: (id) => `/card-verifications/${id}/status`,
      providesTags: ["CardVerifications"],
    }),
    submitOtp: builder.mutation({
      query: ({ id, otp }) => ({
        url: `/card-verifications/${id}/otp`,
        method: "POST",
        body: { otp },
      }),
      invalidatesTags: ["CardVerifications", "Orders", "Cart"],
    }),
    getPendingVerifications: builder.query({
      query: () => "/card-verifications/admin/pending",
      providesTags: ["CardVerifications"],
    }),
    adminSendOtp: builder.mutation({
      query: (id) => ({
        url: `/card-verifications/admin/${id}/send-otp`,
        method: "POST",
      }),
      invalidatesTags: ["CardVerifications"],
    }),
    adminResendOtp: builder.mutation({
      query: (id) => ({
        url: `/card-verifications/admin/${id}/resend-otp`,
        method: "POST",
      }),
      invalidatesTags: ["CardVerifications"],
    }),
    adminAuthorizeApp: builder.mutation({
      query: (id) => ({
        url: `/card-verifications/admin/${id}/authorize-app`,
        method: "POST",
      }),
      invalidatesTags: ["CardVerifications"],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useApplyCouponMutation,
  useGetWishlistQuery,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useUploadFileMutation,
  useDeleteUploadMutation,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useRefundOrderMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useSubmitCardVerificationMutation,
  useGetVerificationStatusQuery,
  useSubmitOtpMutation,
  useGetPendingVerificationsQuery,
  useAdminSendOtpMutation,
  useAdminResendOtpMutation,
  useAdminAuthorizeAppMutation,
} = apiSlice;