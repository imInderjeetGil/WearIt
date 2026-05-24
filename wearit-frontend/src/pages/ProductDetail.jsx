import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import API_BASE from '../config'

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")

  const sizes = ["S", "M", "L", "XL", "XXL"]

  useEffect(() => {
    fetchProduct()
  }, [id])

  async function fetchProduct() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/products/${id}`)
      const data = await res.json()
      setProduct(data)
    } catch (e) {
      console.error("Fetch failed", e)
    }
    setLoading(false)
  }

  async function addToCart() {
    const token = localStorage.getItem("token")
    if (!token) { window.location.href = "/login"; return }
    try {
      const res = await fetch(`${API_BASE}/cart/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ product_id: parseInt(id), quantity: 1 })
      })
      if (res.ok) {
        alert("Added to cart! 🛒")
      } else {
        const data = await res.json()
        alert(data.detail || "Something went wrong!")
      }
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', fontSize: '18px', color: '#a8a8b3', fontWeight: '700' }}>
      Loading...
    </div>
  )

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
      <p style={{ fontSize: '18px', fontWeight: '700', color: '#a8a8b3' }}>Product not found</p>
    </div>
  )

  return (
    <div style={{ background: '#f5f5f6', minHeight: '100vh', padding: '32px 80px' }}>

      <a href="/products" style={{ fontSize: '13px', fontWeight: '700', color: '#f43f5e', textDecoration: 'none' }}>
        ← Back to Products
      </a>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '24px', background: 'white', borderRadius: '8px', padding: '40px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

        <div style={{ background: '#fff0f3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', overflow: 'hidden' }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
          ) : (
            <span style={{ fontSize: '120px' }}>👕</span>
          )}
        </div>

        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a2e', marginBottom: '12px' }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '28px', fontWeight: '900', color: '#1a1a2e' }}>₹{product.price}</span>
            <span style={{ background: '#f43f5e', color: 'white', fontSize: '12px', fontWeight: '800', padding: '3px 8px', borderRadius: '3px' }}>
              WearIt Price
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: product.quantity > 0 ? '#2ecc71' : '#f43f5e' }}>
              {product.quantity > 0 ? `✓ In Stock (${product.quantity} left)` : '✗ Out of Stock'}
            </span>
          </div>

          <p style={{ fontSize: '14px', color: '#7e7e7e', lineHeight: '1.8', marginBottom: '24px', borderTop: '1px solid #ebebeb', paddingTop: '16px' }}>
            {product.description}
          </p>

          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a2e', marginBottom: '12px' }}>
              SELECT SIZE {selectedSize && <span style={{ color: '#f43f5e' }}>— {selectedSize}</span>}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {sizes.map((size) => (
                <button key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    width: '48px', height: '48px', borderRadius: '4px', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                    border: selectedSize === size ? '2px solid #f43f5e' : '2px solid #ebebeb',
                    background: selectedSize === size ? '#fff0f3' : 'white',
                    color: selectedSize === size ? '#f43f5e' : '#1a1a2e'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={addToCart} disabled={product.quantity === 0}
              style={{ flex: 1, padding: '14px', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '800', fontSize: '15px', cursor: product.quantity > 0 ? 'pointer' : 'not-allowed', letterSpacing: '0.5px', opacity: product.quantity === 0 ? 0.5 : 1 }}>
              ADD TO CART
            </button>
            <button disabled={product.quantity === 0}
              style={{ flex: 1, padding: '14px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '800', fontSize: '15px', cursor: product.quantity > 0 ? 'pointer' : 'not-allowed', letterSpacing: '0.5px', opacity: product.quantity === 0 ? 0.5 : 1 }}>
              BUY NOW
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProductDetail