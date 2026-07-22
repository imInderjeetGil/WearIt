import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HeroBanner from '../components/home/HeroBanner'
import CategoryGrid from '../components/home/CategoryGrid'
import FeaturesStrip from '../components/home/FeaturesStrip'
import ProductCard from '../components/product/ProductCard'
import { ProductGridSkeleton } from '../components/ui/Skeleton'
import { getProducts } from '../api/products'
import { Link } from 'react-router-dom'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts({ limit: 8, sort: '-price' })
      .then(({ data }) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <HeroBanner />
      <FeaturesStrip />

      {/* Trending Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-medium">Curated Picks</span>
              <h2 className="text-2xl md:text-3xl font-display font-bold mt-2">Trending Now</h2>
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex text-xs uppercase tracking-[0.15em] font-medium underline underline-offset-4 hover:text-brand transition-colors"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner CTA */}
      <section className="relative h-[50vh] md:h-[60vh] bg-foreground overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=85"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-4 block font-medium">
              New Season
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              Up to 40% Off
            </h2>
            <p className="text-zinc-300 mb-8 max-w-md">
              Limited-time offer on selected styles. Don't miss out on the season's favorites.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-white text-foreground px-8 py-4 text-sm font-medium uppercase tracking-[0.15em] hover:bg-zinc-100 transition-colors"
            >
              Shop the Sale
            </Link>
          </motion.div>
        </div>
      </section>

      <CategoryGrid />
    </>
  )
}
