import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Rahul Mehta",
    quote: "Our living room stays comfortable even in peak summer. The inverter AC is quiet and efficient.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&q=80",
  },
  {
    name: "Priya Sharma",
    quote: "Clear specs and honest pricing. Installation guidance from Cool Breeze made the purchase easy.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&q=80",
  },
  {
    name: "James Okonkwo",
    quote: "Bought a portable AC for the apartment — cools fast and the checkout was seamless as a guest.",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&q=80",
  },
  {
    name: "Aisha Khan",
    quote: "Switched to a 1.5 ton split from Cool Breeze. Energy rating matched what was advertised.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&q=80",
  },
];

function Testimonials() {
  return (
    <section className="w-full">
      <div className="mb-8 text-center sm:mb-10">
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          What Customers Say
        </h2>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Real comfort stories from Cool Breeze shoppers
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t, i) => (
          <motion.blockquote
            key={t.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            className="flex flex-col border border-slate-200 bg-white p-6 transition-all duration-300"
          >
            <div className="mb-4 flex gap-0.5 text-sky-500">
              {[...Array(5)].map((_, idx) => (
                <Star
                  key={idx}
                  size={14}
                  fill={idx < t.rating ? "currentColor" : "none"}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <p className="flex-1 text-sm leading-relaxed text-slate-600">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-5 flex items-center gap-3">
              <img src={t.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              <cite className="not-italic text-sm font-semibold text-slate-900">{t.name}</cite>
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
