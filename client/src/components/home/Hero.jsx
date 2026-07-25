import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1718203862467-c33159fdc504?w=1920&q=80&auto=format",
    headline: "Stay Cool When It Matters Most",
    subtext: "Energy-efficient Split & Inverter ACs engineered for reliable comfort.",
    cta: "Shop Split ACs",
    to: "/shop?category=Split%20ACs",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1700124113583-81aa99ea2aa2?w=1920&q=80&auto=format",
    headline: "Powerful Cooling. Quiet Performance.",
    subtext: "Window, portable, and inverter options sized for every room.",
    cta: "Browse All ACs",
    to: "/shop",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1667983453881-4992fe86ab1b?w=1920&q=80&auto=format",
    headline: "Coolers & Fans for Everyday Comfort",
    subtext: "Trusted brands, clear specs, and secure checkout — all in one place.",
    cta: "Shop Air Coolers",
    to: "/shop?category=Air%20Coolers",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1691351582808-329cde17ffa2?w=1920&q=80&auto=format",
    headline: "Premium Comfort for Modern Homes",
    subtext: "Find the right tonnage, energy rating, and coverage for your space.",
    cta: "View New Arrivals",
    to: "/shop?sort=new",
  },
];

function Hero() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[min(70vh,600px)] min-h-[400px] w-full overflow-hidden bg-sky-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/10 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${slide.id}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.1 },
              },
              exit: { opacity: 0, transition: { duration: 0.3 } },
            }}
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl"
            >
              Cool<span className="text-sky-600"> Breeze</span>
            </motion.p>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-4 max-w-xl font-display text-3xl font-bold leading-tight text-slate-800 sm:text-4xl md:text-5xl"
            >
              {slide.headline}
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-4 max-w-md text-base text-slate-600 sm:text-lg"
            >
              {slide.subtext}
            </motion.p>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-8"
            >
              <Link
                to={slide.to}
                className="inline-flex items-center gap-2 bg-sky-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-500"
              >
                {slide.cta}
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-8 left-4 flex gap-2 sm:left-6 lg:left-8">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 transition-all duration-300 ${
                i === index ? "w-8 bg-sky-600" : "w-4 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
