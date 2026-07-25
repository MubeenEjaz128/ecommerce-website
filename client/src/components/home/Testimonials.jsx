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
  {
    name: "David Chen",
    quote: "Exceptional customer service. The delivery was right on time and the unit is performing flawlessly.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sarah Jenkins",
    quote: "I love the sleek design of their window ACs. Blends perfectly with my interior and cools the room in minutes.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Omar Tariq",
    quote: "Very impressed with the energy efficiency. My electricity bills have noticeably dropped since upgrading.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
  },
];

function Testimonials() {
  return (
    <section className="w-full overflow-hidden py-4">
      <div className="mb-10 text-center sm:mb-14">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Trusted by Thousands
        </h2>
        <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto">
          Discover why our customers rely on Cool Breeze for unmatched cooling performance, energy efficiency, and reliability.
        </p>
      </div>

      {/* Continuous Slider Wrapper */}
      <div className="relative flex w-full overflow-hidden group">
        {/* We use two identical blocks that slide infinitely for a seamless marquee effect */}
        {[1, 2].map((groupIndex) => (
          <motion.div
            key={groupIndex}
            animate={{ x: ["0%", "-100%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 50 }}
            className="flex gap-6 pr-6 shrink-0"
          >
            {testimonials.map((t) => (
              <div
                key={`${groupIndex}-${t.name}`}
                className="flex flex-col w-[260px] sm:w-[380px] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
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
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
