import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useCancelOrderMutation, useGetOrdersQuery, useLogoutMutation } from "../../features/api/apiSlice";

function OrdersPage() {
  const { data, isLoading } = useGetOrdersQuery();
  const [cancelOrder] = useCancelOrderMutation();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();
  const orders = data?.data || [];

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Orders</p>
          <h1 className="mt-3 text-4xl font-black text-text">Order history</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-md border border-red-200 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
      <div className="mt-8 space-y-4">
        {isLoading ? <div className="h-40 animate-pulse rounded-[1.75rem] border border-border bg-surface" /> : null}
        {!isLoading && orders.length === 0 ? (
          <EmptyState />
        ) : null}
        {orders.map((order) => (
          <article key={order._id} className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-text">{order.orderNumber}</h2>
                <p className="mt-1 text-sm text-muted">Status: {order.status} · Total: ${Number(order.totalAmount).toFixed(2)}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={`/orders/${order._id}`} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text">
                  View details
                </Link>
                <button type="button" onClick={() => cancelOrder(order._id)} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text">
                  Cancel order
                </button>
              </div>
            </div>
            <OrderTimeline timeline={order.timeline || []} />
          </article>
        ))}
      </div>
    </section>
  );
}

function OrderTimeline({ timeline }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {timeline.map((step) => (
        <div key={`${step.status}-${step.at}`} className="rounded-2xl bg-accentSoft/40 p-4 text-sm text-text">
          <p className="font-semibold uppercase tracking-[0.2em]">{step.status}</p>
          <p className="mt-2 text-muted">{step.note}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-border bg-surface p-8 text-center shadow-soft">
      <h2 className="text-xl font-bold text-text">No orders yet</h2>
      <p className="mt-3 text-sm text-muted">Your purchases will appear here once checkout is complete.</p>
    </div>
  );
}

export default OrdersPage;