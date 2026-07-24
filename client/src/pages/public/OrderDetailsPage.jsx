import { useParams } from "react-router-dom";
import { useGetOrderQuery } from "../../features/api/apiSlice";

function OrderDetailsPage() {
  const { id } = useParams();
  const { data, isLoading } = useGetOrderQuery(id, { skip: !id });
  const order = data?.data;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Order details</p>
      <h1 className="mt-3 text-4xl font-black text-text">{order?.orderNumber || "Order"}</h1>
      {isLoading ? <div className="mt-8 h-40 animate-pulse rounded-[1.75rem] border border-border bg-surface" /> : null}
      {!isLoading && order ? (
        <div className="mt-8 space-y-6 rounded-[1.75rem] border border-border bg-surface p-6 shadow-soft">
          <p className="text-sm text-muted">Status: {order.status}</p>
          <p className="text-sm text-muted">Payment: {order.paymentStatus}</p>
          <p className="text-sm text-muted">Total: ${Number(order.totalAmount).toFixed(2)}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {order.items.map((item) => (
              <article key={`${item.product?._id || item.name}-${item.sku}`} className="rounded-2xl bg-accentSoft/30 p-4">
                <h2 className="font-bold text-text">{item.name}</h2>
                <p className="mt-2 text-sm text-muted">Qty {item.quantity} · ${Number(item.price).toFixed(2)}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {order.timeline?.map((step) => (
              <div key={`${step.status}-${step.at}`} className="rounded-2xl bg-canvas p-4 text-sm">
                <p className="font-semibold uppercase tracking-[0.2em] text-text">{step.status}</p>
                <p className="mt-2 text-muted">{step.note}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default OrderDetailsPage;