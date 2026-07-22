import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoBagAddOutline } from 'react-icons/io5'
import { formatPrice, isAuthenticated } from '../../utils/helpers'
import toast from 'react-hot-toast'
import useCartStore from '../../store/cartStore'

export default function ProductCard({ product, index = 0 }) {
  const addItem = useCartStore((s) => s.addItem)

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated()) {
      toast.error('Please sign in to add items')
      return
    }
    try {
      await addItem(product.id, 1)
      toast.success('Added to bag')
    } catch {
      toast.error('Failed to add item')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden mb-3">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300 text-sm">
              No image
            </div>
          )}

          {/* Hover actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 w-10 h-10 bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-foreground hover:text-white cursor-pointer"
            aria-label="Quick add to bag"
          >
            <IoBagAddOutline size={18} />
          </button>

          {/* Stock badge */}
          {product.quantity <= 5 && product.quantity > 0 && (
            <span className="absolute top-3 left-3 bg-amber-50 text-amber-700 text-[9px] font-medium uppercase tracking-[0.1em] px-2 py-0.5 border border-amber-200">
              Only {product.quantity} left
            </span>
          )}
          {product.quantity === 0 && (
            <span className="absolute top-3 left-3 bg-rose-50 text-rose-700 text-[9px] font-medium uppercase tracking-[0.1em] px-2 py-0.5 border border-rose-200">
              Out of stock
            </span>
          )}
        </div>

        <h3 className="text-sm font-medium truncate">{product.name}</h3>
        <p className="text-xs text-muted mt-0.5 truncate">{product.description}</p>
        <p className="text-sm font-semibold mt-1.5">{formatPrice(product.price)}</p>
      </Link>
    </motion.div>
  )
}
