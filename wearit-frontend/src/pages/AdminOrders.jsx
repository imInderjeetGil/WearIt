import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import { formatPrice, isAdmin } from '../utils/helpers'
import { getAllOrders } from '../api/orders'

const statusVariant = {
  pending: 'pending',
  paid: 'paid',
  failed: 'failed',
  delivered: 'delivered',
}

const statuses = ['all', 'pending', 'paid', 'delivered', 'failed']

export default function AdminOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!isAdmin()) { navigate('/'); return }
    getAllOrders()
      .then(({ data }) => setOrders(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [navigate])

  const counts = {}
  orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1 })

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-12"><Skeleton className="h-8 w-48 mb-8" /><Skeleton className="h-96 w-full" /></div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-medium">Admin</span>
        <h1 className="text-2xl font-display font-bold mt-1">Orders</h1>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-medium border transition-colors cursor-pointer ${
              filter === s ? 'bg-foreground text-white border-foreground' : 'bg-white text-muted border-border hover:border-foreground'
            }`}
          >
            {s} {s !== 'all' && counts[s] ? `(${counts[s]})` : ''}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted py-12 text-center">No orders found</p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-border">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted font-medium">Order ID</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted font-medium">User ID</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted font-medium">Date</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted font-medium">Items</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted font-medium">Amount</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">#{order.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{order.user_id}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {order.items?.map((item) => (
                      <Link key={item.id} to={`/product/${item.product_id}`} className="block text-xs text-muted hover:text-foreground">
                        Product #{item.product_id} × {item.quantity}
                      </Link>
                    )) || <span className="text-xs text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[order.status] || 'default'}>{order.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
