import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function HeroBanner() {
  return (
    <section className="relative h-[70vh] md:h-[85vh] bg-foreground overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=85"
          alt="Hero"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-lg"
        >
          <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-4 font-medium">
            Summer Collection 2026
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-6">
            Define Your
            <br />
            <span className="text-brand">Style</span>
          </h1>
          <p className="text-base text-zinc-300 mb-8 max-w-md leading-relaxed">
            Discover premium fashion that speaks volumes. Curated pieces for the modern wardrobe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-white text-foreground px-8 py-4 text-sm font-medium uppercase tracking-[0.15em] hover:bg-zinc-100 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              to="/products?category=women"
              className="inline-flex items-center justify-center border-2 border-white/30 text-white px-8 py-4 text-sm font-medium uppercase tracking-[0.15em] hover:bg-white/10 transition-colors"
            >
              Women's Collection
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
