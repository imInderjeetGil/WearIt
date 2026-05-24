import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE from '../config'

function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    useEffect(() => {
        if (!token) { navigate("/login"); return }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            if (payload.role !== "admin") { navigate("/"); return }
        } catch (e) { navigate("/login"); return }
        fetchOrders()
    }, [])

    async function fetchOrders() {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/orders/all`, {
                headers: { "Authorization": "Bearer " + token }
            })
            const data = await res.json()
            setOrders(Array.isArray(data) ? data : [])
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const statusStyle = {
        pending: { bg: '#fef3c7', color: '#d97706' },
        paid: { bg: '#dcfce7', color: '#16a34a' },
        failed: { bg: '#fee2e2', color: '#dc2626' },
        delivered: { bg: '#e0f2fe', color: '#0284c7' },
    }

    return (
        <div style={{ background: '#f5f5f6', minHeight: '100vh', padding: '32px 80px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e' }}>
                    ALL ORDERS <span style={{ color: '#a8a8b3', fontSize: '14px', fontWeight: '400' }}>({orders.length} total)</span>
                </h1>

                {/* Status counts */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    {['pending', 'paid', 'delivered', 'failed'].map(s => (
                        <div key={s} style={{ background: statusStyle[s]?.bg, color: statusStyle[s]?.color, padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                            {orders.filter(o => o.status === s).length} {s.toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px', color: '#a8a8b3', fontWeight: '700' }}>Loading...</div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '8px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#a8a8b3' }}>No orders yet</p>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f6', borderBottom: '2px solid #ebebeb' }}>
                                {['Order ID', 'User ID', 'Date', 'Items', 'Amount', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#a8a8b3', letterSpacing: '0.5px' }}>{h.toUpperCase()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #f5f5f6' }}>
                                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#1a1a2e' }}>#{order.id}</td>
                                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#7e7e7e' }}>User #{order.user_id}</td>
                                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#7e7e7e' }}>
                                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            {order.items.map(item => (
                                                <a key={item.id} href={`/product/${item.product_id}`}
                                                    style={{ display: 'block', fontSize: '12px', color: '#f43f5e', fontWeight: '700', textDecoration: 'none', marginBottom: '2px' }}>
                                                    Product #{item.product_id} × {item.quantity} — ₹{item.price}
                                                </a>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '800', color: '#1a1a2e' }}>₹{order.total_amount}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ background: statusStyle[order.status]?.bg || '#f5f5f6', color: statusStyle[order.status]?.color || '#1a1a2e', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                                            {order.status?.toUpperCase()}
                                        </span>
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

export default AdminOrders