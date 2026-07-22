import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { IoClose, IoTrashOutline } from 'react-icons/io5'
import useCartStore from '../../store/cartStore'
import { formatPrice } from '../../utils/helpers'

import toast from 'react-hot-toast'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, loading } = useCartStore()

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const handleRemove = async (id) => {
    try {
      await removeItem(id)
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-sm font-medium uppercase tracking-[0.15em]">
                Shopping Bag ({items.length})
              </h2>
              <button onClick={closeCart} className="p-1 hover:bg-zinc-100 transition-colors cursor-pointer">
                <IoClose size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="w-6 h-6 border-2 border-zinc-300 border-t-foreground rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <IoBagOutline className="text-4xl text-zinc-300 mb-4" />
                  <p className="text-sm text-muted mb-4">Your bag is empty</p>
                  <button onClick={closeCart} className="text-xs uppercase tracking-[0.15em] font-medium underline underline-offset-4 cursor-pointer">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 border-b border-border/50">
                      <div className="w-20 h-24 bg-zinc-100 overflow-hidden flex-shrink-0">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{item.product.name}</h3>
                        <p className="text-xs text-muted mt-0.5">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold mt-1">{formatPrice(item.product.price)}</p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="self-start p-1 text-muted hover:text-brand transition-colors cursor-pointer"
                      >
                        <IoTrashOutline size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-6 py-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-[11px] text-muted">Free delivery on orders over ₹999</p>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="block w-full text-center bg-foreground text-white py-3.5 text-sm font-medium uppercase tracking-[0.15em] hover:bg-foreground/90 transition-colors"
                >
                  View Bag & Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function IoBagOutline({ className }) {
  return (
    <svg className={className} stroke="currentColor" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}
