import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import { formatPrice, isAuthenticated } from '../utils/helpers'
import { getMyOrders } from '../api/orders'

const statusVariant = {
  pending: 'pending',
  paid: 'paid',
  failed: 'failed',
  delivered: 'delivered',
}

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    getMyOrders()
      .then(({ data }) => setOrders(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-xl font-display font-bold mb-2">No orders yet</h2>
        <p className="text-sm text-muted mb-6">Start shopping to see your orders here.</p>
        <Link to="/products" className="inline-flex items-center justify-center bg-foreground text-white px-8 py-3 text-sm font-medium uppercase tracking-[0.15em] hover:bg-foreground/90 transition-colors">
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border p-4 md:p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-muted uppercase tracking-[0.1em]">Order #{order.id}</p>
                <p className="text-xs text-muted mt-0.5">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  }) : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariant[order.status] || 'default'}>
                  {order.status}
                </Badge>
                <span className="text-sm font-semibold">{formatPrice(order.total_amount)}</span>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-2">Items</p>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.product_id}`}
                      className="block text-xs text-muted hover:text-foreground transition-colors"
                    >
                      {item.product_name || `Product #${item.product_id}`} × {item.quantity}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
