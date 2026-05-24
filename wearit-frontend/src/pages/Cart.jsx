import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE from '../config'

function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    fetchCart()
  }, [])

  async function fetchCart() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/cart/`, {
        headers: { "Authorization": "Bearer " + token }
      })
      const data = await res.json()
      setCartItems(data)
    } catch (e) {
      console.error("Cart fetch failed", e)
    }
    setLoading(false)
  }

  async function removeItem(cartId) {
    try {
      await fetch(`${API_BASE}/cart/${cartId}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
      })
      fetchCart()
    } catch (e) {
      console.error("Remove failed", e)
    }
  }

  async function checkout() {
    try {
      const res = await fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers: { "Authorization": "Bearer " + token }
      })
      const data = await res.json()
      const options = {
        key: data.razorpay_key_id,
        amount: data.amount,
        currency: "INR",
        name: "WearIt",
        description: "Your WearIt Order",
        order_id: data.razorpay_order_id,
        handler: async function (response) {
          await fetch(`${API_BASE}/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify({ ...response, order_id: data.order_id })
          })
          window.location.href = "/payment-success"
        },
        theme: { color: "#f43f5e" }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      console.error("Checkout failed", e)
    }
  }

  const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', fontSize: '18px', color: '#a8a8b3', fontWeight: '700' }}>Loading...</div>
  )

  return (
    <div style={{ background: '#f5f5f6', minHeight: '100vh', padding: '32px 80px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e', marginBottom: '24px' }}>YOUR CART</h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '8px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#a8a8b3', marginBottom: '16px' }}>Your cart is empty</p>
          <a href="/products" style={{ background: '#f43f5e', color: 'white', padding: '12px 32px', borderRadius: '4px', fontWeight: '800', textDecoration: 'none', fontSize: '14px' }}>
            SHOP NOW →
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ background: 'white', borderRadius: '8px', padding: '20px', display: 'flex', gap: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ width: '90px', height: '90px', background: '#fff0f3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {item.product?.image_url
                    ? <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '36px' }}>👕</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>{item.product?.name}</div>
                  <div style={{ fontSize: '13px', color: '#a8a8b3', marginBottom: '8px' }}>Qty: {item.quantity}</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a2e' }}>₹{item.product?.price}</div>
                </div>
                <button onClick={() => removeItem(item.id)}
                  style={{ background: 'none', border: 'none', color: '#f43f5e', fontWeight: '800', cursor: 'pointer', fontSize: '13px', alignSelf: 'flex-start' }}>
                  REMOVE
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: 'fit-content' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a2e', marginBottom: '20px' }}>ORDER SUMMARY</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#7e7e7e' }}>
              <span>Subtotal</span><span>₹{total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px', color: '#2ecc71', fontWeight: '700' }}>
              <span>Delivery</span><span>FREE</span>
            </div>
            <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a2e' }}>Total</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#1a1a2e' }}>₹{total}</span>
            </div>
            <button onClick={checkout}
              style={{ width: '100%', background: '#f43f5e', color: 'white', padding: '14px', border: 'none', borderRadius: '4px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', letterSpacing: '0.5px' }}>
              PROCEED TO CHECKOUT →
            </button>
          </div>

        </div>
      )}
    </div>
  )
}

export default Cart