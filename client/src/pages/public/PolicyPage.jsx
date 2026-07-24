import { useParams, Link } from "react-router-dom";

const policyContent = {
  privacy: {
    title: "Privacy Policy",
    body: "Cool Breeze collects only the information needed to process orders and improve your shopping experience. We never sell your personal data. Payment details are encrypted and processed through secure providers.",
  },
  terms: {
    title: "Terms & Conditions",
    body: "By using Cool Breeze you agree to our store policies, fair use of the site, and accurate order information. Prices and availability may change without notice.",
  },
  refund: {
    title: "Refund Policy",
    body: "Eligible unused items may be returned within 30 days of purchase for a refund to the original payment method, subject to inspection and manufacturer guidelines for appliances.",
  },
  loyalty: {
    title: "Loyalty Rewards",
    body: "Earn points on every Cool Breeze purchase and redeem them for discounts on future cooling products. Points are credited after order completion.",
  },
  "shipping-return": {
    title: "Shipping & Return",
    body: "Orders are processed promptly and tracked once dispatched. Returns are accepted within the stated window for eligible products. Contact support to start a return.",
  },
  shipping: {
    title: "Shipping & Return",
    body: "Orders are processed promptly and tracked once dispatched.",
  },
  returns: {
    title: "Returns",
    body: "Start a return from your order history or contact Cool Breeze support.",
  },
};

function PolicyPage() {
  const { slug } = useParams();
  const content = policyContent[slug] || {
    title: slug?.replace(/-/g, " ") || "Policy",
    body: "This policy page is ready for detailed content.",
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">Cool Breeze</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold capitalize text-slate-900">{content.title}</h1>
      <p className="mt-6 text-base leading-relaxed text-slate-600">{content.body}</p>
      <Link to="/contact" className="mt-8 inline-block text-sm font-semibold text-sky-700 hover:underline">
        Questions? Contact us →
      </Link>
    </section>
  );
}

export default PolicyPage;
