import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API_BASE from '../config'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const statusStyle = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    failed: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    delivered: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  }

  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: { "Authorization": "Bearer " + token }
      })
      const data = await res.json()
      setOrders(data)
    } catch (e) {
      console.error("Orders fetch failed", e)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    fetchOrders()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
        <h1 className="text-xl md:text-2xl font-extrabold text-dark tracking-tight mb-6">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <div className="text-5xl mb-4">&#x1F4CB;</div>
            <p className="text-lg font-bold text-zinc-400 mb-5">No orders yet</p>
            <Link to="/products" className="inline-block bg-brand text-white text-sm font-bold px-8 py-3 rounded-xl no-underline hover:bg-brand-dark transition-colors">
              Shop Now &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const s = statusStyle[order.status] || { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200' }
              return (
                <div key={order.id} className="bg-white rounded-xl border border-border p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">
                        Order #{order.id} &middot; {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xl font-extrabold text-dark">₹{order.total_amount}</p>
                    </div>
                    <span className={`self-start text-[11px] font-bold px-3 py-1.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    {order.items.map(item => (
                      <Link key={item.id} to={`/product/${item.product_id}`}
                        className="block text-sm text-brand font-semibold no-underline hover:underline">
                        Product #{item.product_id} &times; {item.quantity} &mdash; ₹{item.price}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
