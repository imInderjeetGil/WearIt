import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import API_BASE from '../config'
import TryOnModal from '../components/TryOnModal'

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState("")

  const sizes = ["S", "M", "L", "XL", "XXL"]

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

  useEffect(() => {
    fetchProduct()
  }, [id])

  async function addToCart() {
    const token = localStorage.getItem("token")
    if (!token) { window.location.href = "/login"; return }
    setAddingToCart(true)
    try {
      const res = await fetch(`${API_BASE}/cart/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ product_id: parseInt(id), quantity: 1 })
      })
      if (res.ok) {
        setCartMessage("Added to cart!")
        setTimeout(() => setCartMessage(""), 2000)
      } else {
        const data = await res.json()
        setCartMessage(data.detail || "Something went wrong!")
        setTimeout(() => setCartMessage(""), 3000)
      }
    } catch (e) {
      setCartMessage(e.message)
    }
    setAddingToCart(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-zinc-400 font-medium">Loading...</p>
      </div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">&#x1F615;</div>
        <p className="text-lg font-bold text-zinc-400">Product not found</p>
        <Link to="/products" className="inline-block mt-4 text-sm font-semibold text-brand no-underline hover:underline">Back to Products</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand no-underline hover:underline mb-6">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10 bg-white rounded-2xl border border-border p-4 md:p-8">
          {/* Image */}
          <div className="aspect-[4/5] bg-zinc-50 rounded-xl overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">&#x1F455;</div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-extrabold text-dark tracking-tight mb-3">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-black text-dark">₹{product.price}</span>
              <span className="text-[11px] font-bold text-white bg-brand px-2.5 py-1 rounded-md">WearIt Price</span>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${product.quantity > 0 ? 'text-emerald-600' : 'text-brand'}`}>
                <span className={`w-2 h-2 rounded-full ${product.quantity > 0 ? 'bg-emerald-500' : 'bg-brand'}`} />
                {product.quantity > 0 ? `In Stock (${product.quantity} left)` : 'Out of Stock'}
              </span>
            </div>

            <p className="text-sm text-zinc-500 leading-relaxed mb-8 border-t border-border pt-5">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-8">
              <div className="text-xs font-bold text-dark uppercase tracking-wider mb-3">
                Select Size {selectedSize && <span className="text-brand">— {selectedSize}</span>}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-brand text-white border-2 border-brand shadow-md'
                        : 'bg-white text-zinc-600 border-2 border-border hover:border-zinc-400'
                    }`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            {cartMessage && (
              <div className={`text-sm font-semibold mb-4 px-4 py-2.5 rounded-lg border ${
                cartMessage === "Added to cart!" ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-brand border-rose-200'
              }`}>
                {cartMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button onClick={addToCart} disabled={product.quantity === 0 || addingToCart}
                className="flex-1 py-3.5 bg-brand text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-dark cursor-pointer tracking-wide">
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={() => setIsModalOpen(true)}
                className="py-3.5 bg-dark text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer px-6 tracking-wide">
                Virtual Try-On
              </button>
              <button disabled={product.quantity === 0}
                className="flex-1 py-3.5 bg-dark text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 cursor-pointer tracking-wide">
                Buy Now
              </button>
            </div>
          </div>
        </div>

        <TryOnModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} productId={product.id} productName={product.name} />
      </div>
    </div>
  )
}

export default ProductDetail
