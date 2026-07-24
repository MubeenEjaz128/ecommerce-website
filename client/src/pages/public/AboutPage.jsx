import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Snowflake } from "lucide-react";

function AboutPage() {
  return (
    <div className="min-h-screen bg-sky-50/50">
      <section className="relative h-[38vh] min-h-[280px] overflow-hidden bg-sky-50">
        <img
          src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1920&q=80"
          alt="Modern Air Conditioner"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/10 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <p className="flex items-center gap-2 font-display text-lg font-bold text-sky-600">
              <Snowflake size={20} /> Cool Breeze
            </p>
            <h1 className="mt-1 font-display text-4xl font-extrabold text-slate-800 sm:text-5xl">About Us</h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-lg leading-relaxed text-slate-600">
            Cool Breeze is a modern online store dedicated to air conditioners and cooling appliances —
            Split ACs, Window ACs, Portable units, Inverter models, air coolers, fans, and filters.
          </p>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            We focus on clear specifications, trusted brands, and a secure shopping experience. Guest
            browsing and checkout are always welcome — create an account only when you want order history
            or saved preferences.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/shop" className="bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-500">
              Shop cooling products
            </Link>
            <Link
              to="/contact"
              className="border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
            >
              Contact us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AboutPage;
