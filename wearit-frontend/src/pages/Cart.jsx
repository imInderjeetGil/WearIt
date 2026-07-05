import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API_BASE from '../config'

function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

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

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    fetchCart()
  }, [])

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
        theme: { color: "#e11d48" }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      console.error("Checkout failed", e)
    }
  }

  const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
        <h1 className="text-xl md:text-2xl font-extrabold text-dark tracking-tight mb-6">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <div className="text-5xl mb-4">&#x1F6D2;</div>
            <p className="text-lg font-bold text-zinc-400 mb-5">Your cart is empty</p>
            <Link to="/products" className="inline-block bg-brand text-white text-sm font-bold px-8 py-3 rounded-xl no-underline hover:bg-brand-dark transition-colors">
              Shop Now &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6">
            {/* Cart Items */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-border p-4 flex gap-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-50 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.image_url
                      ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">&#x1F455;</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-semibold text-dark truncate">{item.product?.name}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Qty: {item.quantity}</p>
                    <p className="text-base font-bold text-dark mt-1.5">₹{item.product?.price}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)}
                    className="text-xs font-bold text-brand bg-transparent border-none cursor-pointer hover:underline self-start flex-shrink-0">
                    REMOVE
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-border p-6 h-fit lg:sticky lg:top-24">
              <h2 className="text-sm font-bold text-dark uppercase tracking-wider mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-dark">₹{total}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Delivery</span>
                  <span>FREE</span>
                </div>
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between mb-6">
                <span className="text-base font-bold text-dark">Total</span>
                <span className="text-xl font-black text-dark">₹{total}</span>
              </div>
              <button onClick={checkout}
                className="w-full bg-brand text-white text-sm font-bold py-3.5 rounded-xl hover:bg-brand-dark transition-colors cursor-pointer border-none tracking-wide">
                Proceed to Checkout &rarr;
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
                </svg>
                Secure checkout with Razorpay
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
