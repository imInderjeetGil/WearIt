import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoTrashOutline } from 'react-icons/io5'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { formatPrice, isAuthenticated } from '../utils/helpers'
import { getCart, removeFromCart } from '../api/cart'
import { createRazorpayOrder, verifyPayment } from '../api/payments'
import toast from 'react-hot-toast'

export default function Cart() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    getCart()
      .then(({ data }) => setItems(data))
      .catch(() => toast.error('Failed to load cart'))
      .finally(() => setLoading(false))
  }, [navigate])

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const delivery = subtotal >= 999 ? 0 : 99
  const total = subtotal + delivery

  const handleRemove = async (id) => {
    try {
      await removeFromCart(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    try {
      const { data } = await createRazorpayOrder()
      const { razorpay_order_id, amount, order_id, razorpay_key_id } = data

      const options = {
        key: razorpay_key_id,
        amount,
        currency: 'INR',
        name: 'WearIt',
        description: 'Premium Fashion',
        order_id: razorpay_order_id,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id,
            })
            navigate('/payment-success')
          } catch {
            toast.error('Payment verification failed')
          }
        },
        modal: {
          ondismiss: () => setCheckingOut(false),
        },
        prefill: {
          contact: '',
          email: '',
        },
        theme: { color: '#18181b' },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        toast.error('Payment failed')
        setCheckingOut(false)
      })
      rzp.open()
    } catch {
      toast.error('Failed to initiate payment')
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-display font-bold mb-2">Your bag is empty</h2>
        <p className="text-sm text-muted mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="inline-flex items-center justify-center bg-foreground text-white px-8 py-3 text-sm font-medium uppercase tracking-[0.15em] hover:bg-foreground/90 transition-colors">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-2 mb-8">
        <Link to="/products" className="text-xs text-muted hover:text-foreground uppercase tracking-[0.1em] transition-colors">
          Shopping
        </Link>
        <span className="text-muted text-[10px]">/</span>
        <span className="text-xs uppercase tracking-[0.1em]">Shopping Bag</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-display font-bold mb-8">Shopping Bag ({items.length})</h1>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 p-4 border border-border"
            >
              <div className="w-24 h-28 bg-zinc-100 overflow-hidden flex-shrink-0">
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs">No image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product_id}`} className="text-sm font-medium hover:text-brand transition-colors">
                  {item.product.name}
                </Link>
                <p className="text-xs text-muted mt-1">Qty: {item.quantity}</p>
                <p className="text-sm font-semibold mt-2">{formatPrice(item.product.price)}</p>
              </div>
              <button onClick={() => handleRemove(item.id)} className="self-start p-1 text-muted hover:text-brand transition-colors cursor-pointer" aria-label="Remove item">
                <IoTrashOutline size={18} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-border p-6 lg:sticky lg:top-24">
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span>{delivery === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(delivery)}</span>
              </div>
              {delivery > 0 && (
                <p className="text-[11px] text-muted">Add ₹{formatPrice(999 - subtotal)} more for free delivery</p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Button variant="primary" size="lg" className="w-full mt-6" onClick={handleCheckout} loading={checkingOut}>
              Proceed to Checkout
            </Button>
            <Link to="/products" className="block text-center text-xs text-muted hover:text-foreground mt-4 underline underline-offset-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
