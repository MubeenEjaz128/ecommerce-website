import { useParams, Link } from "react-router-dom";

const policyContent = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        subtitle: "Information We Collect",
        text: "At Cool Breeze, we collect personal information such as your name, email address, shipping address, and payment details when you place an order. We also collect non-identifiable data such as browser type and IP address to improve our website experience."
      },
      {
        subtitle: "How We Use Your Information",
        text: "Your information is strictly used to process and fulfill your orders, communicate with you regarding your purchases, and send you promotional offers if you have opted in to our newsletter. We do not sell or rent your personal information to third parties."
      },
      {
        subtitle: "Data Security",
        text: "We implement industry-standard security measures, including SSL encryption, to protect your personal and payment data during transmission. Your data is stored securely and accessible only by authorized personnel."
      }
    ]
  },
  terms: {
    title: "Terms & Conditions",
    sections: [
      {
        subtitle: "General Terms",
        text: "By accessing and using the Cool Breeze website, you agree to comply with and be bound by these terms. If you do not agree, please refrain from using our services. We reserve the right to update or modify these terms at any time."
      },
      {
        subtitle: "Pricing and Availability",
        text: "All prices are listed in USD and are subject to change without notice. We strive to maintain accurate inventory, but in the event a product is out of stock after your order is placed, we will notify you and provide a full refund."
      },
      {
        subtitle: "User Responsibilities",
        text: "You agree to provide accurate and current information when creating an account or placing an order. You are responsible for maintaining the confidentiality of your account credentials."
      }
    ]
  },
  refund: {
    title: "Refund Policy",
    sections: [
      {
        subtitle: "Eligibility for Refunds",
        text: "To be eligible for a refund, items must be returned within 30 days of the delivery date. The product must be unused, in its original packaging, and in the same condition that you received it."
      },
      {
        subtitle: "Refund Process",
        text: "Once your return is received and inspected, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 business days."
      },
      {
        subtitle: "Non-Refundable Items",
        text: "Certain items, such as gift cards, clearance merchandise, and damaged items not due to our error, are exempt from being returned and refunded."
      }
    ]
  },
  "shipping-return": {
    title: "Shipping & Return Policy",
    sections: [
      {
        subtitle: "Shipping Timelines",
        text: "All orders are processed within 1-2 business days. Standard shipping typically takes 3-5 business days, while expedited shipping options are available at checkout. You will receive a tracking number via email once your order has dispatched."
      },
      {
        subtitle: "Shipping Costs",
        text: "Shipping charges for your order will be calculated and displayed at checkout. We offer free standard shipping on orders over $500."
      },
      {
        subtitle: "Return Procedure",
        text: "If you are not entirely satisfied with your purchase, you may initiate a return within 30 days. Please contact our support team to obtain a Return Merchandise Authorization (RMA) number before shipping the product back to us."
      }
    ]
  },
  loyalty: {
    title: "Loyalty Rewards Program",
    sections: [
      {
        subtitle: "Earning Points",
        text: "Join the Cool Breeze Loyalty Program and earn points for every dollar spent on our store. You can also earn bonus points for signing up, leaving reviews, and referring friends."
      },
      {
        subtitle: "Redeeming Points",
        text: "Points can be redeemed at checkout for discounts on your future orders. Every 100 points equals $1 in store credit. Points do not expire as long as your account remains active."
      }
    ]
  }
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
      
      <div className="mt-10 space-y-8">
        {content.sections ? (
          content.sections.map((sec, idx) => (
            <div key={idx}>
              <h2 className="text-xl font-bold text-slate-800 mb-2">{sec.subtitle}</h2>
              <p className="text-base leading-relaxed text-slate-600">{sec.text}</p>
            </div>
          ))
        ) : (
          <p className="mt-6 text-base leading-relaxed text-slate-600">{content.body}</p>
        )}
      </div>

      <Link to="/contact" className="mt-12 inline-block text-sm font-semibold text-sky-700 hover:underline">
        Questions? Contact us →
      </Link>
    </section>
  );
}

export default PolicyPage;
