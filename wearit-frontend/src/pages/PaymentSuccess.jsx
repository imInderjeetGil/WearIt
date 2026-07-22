import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { IoCheckmarkCircle } from 'react-icons/io5'

export default function PaymentSuccess() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, duration: 0.6 }}
        >
          <IoCheckmarkCircle size={64} className="mx-auto text-emerald-500 mb-6" />
        </motion.div>

        <h1 className="text-2xl font-display font-bold mb-2">Order Placed!</h1>
        <p className="text-sm text-muted mb-8">
          Thank you for your purchase. You'll receive a confirmation shortly.
        </p>

        <div className="bg-zinc-50 border border-border p-4 mb-8 text-left text-sm space-y-2">
          <p className="flex justify-between">
            <span className="text-muted">Status</span>
            <span className="text-emerald-600 font-medium">Confirmed</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted">Delivery</span>
            <span>2-3 business days</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted">Confirmation</span>
            <span>Sent to your email</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center bg-foreground text-white px-8 py-3 text-sm font-medium uppercase tracking-[0.15em] hover:bg-foreground/90 transition-colors"
          >
            View Orders
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center border-2 border-foreground text-foreground px-8 py-3 text-sm font-medium uppercase tracking-[0.15em] hover:bg-foreground hover:text-white transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
