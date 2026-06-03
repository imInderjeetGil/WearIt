import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE from '../config'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const statusStyle = {
  pending:   { bg: '#fef3c7', color: '#d97706' },
  paid:      { bg: '#dcfce7', color: '#16a34a' },
  failed:    { bg: '#fee2e2', color: '#dc2626' },
  delivered: { bg: '#e0f2fe', color: '#0284c7' },
}

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    fetchOrders()
  }, [])

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

  const statusColor = {
    pending: { bg: '#fef3c7', color: '#d97706' },
    paid: { bg: '#dcfce7', color: '#16a34a' },
    cancelled: { bg: '#fee2e2', color: '#dc2626' },
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', fontSize: '18px', color: '#a8a8b3', fontWeight: '700' }}>Loading...</div>
  )

  return (
    <div className="responsive-page" style={{ background: '#f5f5f6', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e', marginBottom: '24px' }}>YOUR ORDERS</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '8px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#a8a8b3', marginBottom: '16px' }}>No orders yet</p>
          <a href="/products" style={{ background: '#f43f5e', color: 'white', padding: '12px 32px', borderRadius: '4px', fontWeight: '800', textDecoration: 'none', fontSize: '14px' }}>
            SHOP NOW →
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#a8a8b3', marginBottom: '4px' }}>Order #{order.id} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a2e' }}>₹{order.total_amount}</div>
                </div>
                <span style={{ background: statusStyle[order.status]?.bg || '#f5f5f6', color: statusStyle[order.status]?.color || '#1a1a2e', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                  {order.status?.toUpperCase()}
                </span>
              </div>

              {/* Items */}
              <div style={{ borderTop: '1px solid #f5f5f6', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {order.items.map(item => (
                  <a key={item.id} href={`/product/${item.product_id}`}
                    style={{ fontSize: '13px', color: '#f43f5e', fontWeight: '700', textDecoration: 'none' }}>
                    Product #{item.product_id} × {item.quantity} — ₹{item.price}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders