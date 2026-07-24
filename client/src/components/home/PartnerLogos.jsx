import { motion } from "framer-motion";

const partners = [
  { name: "Samsung", src: "/partners/samsung.svg" },
  { name: "LG", src: "/partners/lg.svg" },
  { name: "Panasonic", src: "/partners/panasonic.svg" },
  { name: "Sony", src: "/partners/sony.svg" },
  { name: "Philips", src: "/partners/philips.svg" },
  { name: "Bosch", src: "/partners/bosch.svg" },
  { name: "Siemens", src: "/partners/siemens.svg" },
  { name: "Hitachi", src: "/partners/hitachi.svg" },
];

function PartnerLogos() {
  return (
    <section className="w-full overflow-hidden">
      <div className="mb-10 text-center">
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Our Partners
        </h2>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Leading appliance and cooling brands we carry
        </p>
      </div>

      <div className="relative flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-2">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          className="flex w-max items-stretch gap-4 px-2 lg:gap-5"
        >
          {[...partners, ...partners].map((partner, idx) => (
            <div
              key={`${partner.name}-${idx}`}
              className="flex h-20 w-32 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-4 transition hover:border-sky-300 hover:shadow-md sm:h-24 sm:w-36 lg:w-44"
            >
              <img
                src={partner.src}
                alt={`${partner.name} official logo`}
                title={partner.name}
                className="max-h-12 w-auto max-w-full object-contain sm:max-h-14"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default PartnerLogos;
