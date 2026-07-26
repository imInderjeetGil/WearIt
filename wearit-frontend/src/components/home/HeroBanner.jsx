import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeroBanner() {
  return (
    <section className="relative h-screen overflow-hidden bg-black">
      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=2200&q=90"
        alt="WearIt Collection"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="relative mx-auto flex h-full max-w-[1500px] items-center px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8 }}
          className="max-w-xl"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-white/70">
            New Collection 2026
          </p>

          <h1 className="leading-none font-black uppercase text-white text-6xl md:text-8xl">
            WEAR
            <br />
            YOUR
            <br />
            CONFIDENCE
          </h1>

          <p className="mt-8 max-w-md text-base leading-8 text-white/80">
            Minimal silhouettes. Premium fabrics.
            Designed for everyday essentials inspired by modern streetwear.
          </p>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="bg-white px-10 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200"
            >
              Shop Now
            </Link>

            <Link
              to="/products"
              className="border border-white px-10 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
            >
              Explore
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom Label */}
      <div className="absolute bottom-10 left-10 hidden lg:block">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Premium Streetwear
        </p>
      </div>

      <div className="absolute bottom-10 right-10 hidden lg:block">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Since 2026
        </p>
      </div>
    </section>
  );
}