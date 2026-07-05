import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE from '../config'

function AdminOrders() {
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
      const res = await fetch(`${API_BASE}/orders/all`, {
        headers: { "Authorization": "Bearer " + token }
      })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch { console.error("fetch failed") }
    setLoading(false)
  }

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== "admin") { navigate("/"); return }
    } catch { navigate("/login"); return }
    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-dark tracking-tight">
            All Orders <span className="text-zinc-400 text-sm font-medium">({orders.length} total)</span>
          </h1>
          <div className="flex flex-wrap gap-2">
            {['pending', 'paid', 'delivered', 'failed'].map(s => {
              const st = statusStyle[s] || {}
              return (
                <span key={s} className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${st.bg || 'bg-zinc-50'} ${st.text || 'text-zinc-600'} ${st.border || 'border-zinc-200'}`}>
                  {orders.filter(o => o.status === s).length} {s.toUpperCase()}
                </span>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm font-medium text-zinc-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <div className="text-5xl mb-4">&#x1F4CB;</div>
            <p className="text-lg font-bold text-zinc-400">No orders yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-50 border-b border-border">
                    {['Order ID', 'User ID', 'Date', 'Items', 'Amount', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const s = statusStyle[order.status] || { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200' }
                    return (
                      <tr key={order.id} className="border-b border-border last:border-b-0 hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-bold text-dark">#{order.id}</td>
                        <td className="px-4 py-3 text-sm text-zinc-500">User #{order.user_id}</td>
                        <td className="px-4 py-3 text-sm text-zinc-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            {order.items?.map(item => (
                              <a key={item.id} href={`/product/${item.product_id}`}
                                className="block text-xs text-brand font-semibold no-underline hover:underline">
                                Product #{item.product_id} &times; {item.quantity} &mdash; ₹{item.price}
                              </a>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-extrabold text-dark">₹{order.total_amount}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                            {order.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders
