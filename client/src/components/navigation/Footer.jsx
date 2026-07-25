import { useState } from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa6";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { VisaLogo, MastercardLogo, AmexLogo, DiscoverLogo } from "../ui/CardLogos";

function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Thanks for subscribing to Cool Breeze updates!");
    setEmail("");
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-16 bg-sky-50 border-t border-slate-200 text-slate-600"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:flex-wrap lg:flex-nowrap lg:justify-between w-full">

          {/* Payment Security Badges — Left Column (no PayPal) */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-800 mb-5">
              Secure Payment Method
            </h3>

            {/* White card wrapper */}
            <div className="bg-white rounded-xl p-3 shadow-lg">
              {/* Top badges row — icons exactly like the reference image */}
              <div className="flex items-start justify-center gap-5 mb-3">

                {/* Secure Checkout — solid filled shield with checkmark */}
                <div className="flex flex-col items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                    <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5L12 2z" fill="#1e293b"/>
                    <polyline points="9 12 11 14 15 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[9px] font-bold text-slate-700 text-center leading-tight uppercase tracking-tight">
                    Secure<br/>Checkout
                  </span>
                </div>

                {/* SSL Secure — solid filled padlock */}
                <div className="flex flex-col items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                    <rect x="5" y="11" width="14" height="10" rx="2" fill="#1e293b"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1.5" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-bold text-slate-700 text-center leading-tight uppercase tracking-tight">
                    SSL Secure<br/>AES 256-bit
                  </span>
                </div>

              </div>

              {/* Safe & Secure text */}
              <p className="text-[11px] font-bold text-slate-900 text-center mb-2.5">
                Safe and Secure SSL Encrypted
              </p>

              {/* Card brand logos — original proper logos */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <VisaLogo width={46} height={29} />
                <MastercardLogo width={46} height={29} />
                <AmexLogo width={46} height={29} />
                <DiscoverLogo width={46} height={29} />
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-800">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {[["About Us", "/about"], ["Contact Us", "/contact"], ["Loyalty", "/policies/loyalty"]].map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="text-sm text-slate-500 transition hover:text-sky-600">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-800">Policies</h3>
            <ul className="mt-4 space-y-2.5">
              {[["Privacy Policy", "/policies/privacy"], ["Terms & Conditions", "/policies/terms"], ["Refund Policy", "/policies/refund"], ["Shipping & Return", "/policies/shipping-return"]].map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="text-sm text-slate-500 transition hover:text-sky-600">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-800">
              Newsletter
            </h3>
            <p className="mt-3 text-sm text-slate-500">
              Cooling tips, seasonal deals, and new AC launches.
            </p>
            <form onSubmit={handleNewsletter} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-500"
              />
              <button
                type="submit"
                className="bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
              >
                Subscribe
              </button>
            </form>

            <div className="mt-6 flex gap-3">
              <SocialLink href="https://facebook.com" label="Facebook">
                <FaFacebookF size={18} />
              </SocialLink>
              <SocialLink href="https://tiktok.com" label="TikTok">
                <FaTiktok size={18} />
              </SocialLink>
              <SocialLink href="https://instagram.com" label="Instagram">
                <FaInstagram size={18} />
              </SocialLink>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Cool Breeze. All rights reserved.</p>
      </div>
    </motion.footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-800">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, path]) => (
          <li key={label}>
            <Link to={path} className="text-sm text-slate-500 transition hover:text-sky-600">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center border border-slate-300 bg-white text-slate-600 transition hover:border-sky-500 hover:text-sky-600"
    >
      {children}
    </a>
  );
}

export default Footer;
