import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "../../features/api/apiSlice";

function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const [createOrder] = useCreateOrderMutation();

  useEffect(() => {
    async function finalize() {
      if (!sessionId) return navigate('/orders');
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/payments/session?sessionId=${encodeURIComponent(sessionId)}`, { credentials: 'include' });
      const payload = await resp.json();
      const paymentIntentId = payload?.data?.payment_intent?.id || payload?.data?.payment_intent;
      await createOrder({ shippingAddress: {}, billingAddress: {}, paymentMethod: 'stripe', paymentIntentId }).unwrap().catch(() => null);
      navigate('/orders');
    }
    finalize();
  }, [sessionId]);

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold">Processing payment...</h1>
      <p className="mt-4 text-sm text-muted">Finishing your order, you will be redirected shortly.</p>
    </section>
  );
}

export default CheckoutSuccess;
