import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE from '../config'

function Home() {
  const [trending, setTrending] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE}/products/?limit=8`)
      .then(res => res.json())
      .then(data => setTrending(data))
  }, [])

  const categories = [
    { label: 'Men', img: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=400', q: 'men' },
    { label: 'Women', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400', q: 'women' },
    { label: 'Kids', img: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=400', q: 'kids' },
    { label: 'Ethnic', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400', q: 'ethnic' },
    { label: 'Sports', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400', q: 'sports' },
    { label: 'Accessories', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400', q: 'accessories' },
  ]

  const offers = [
    { title: 'Free Delivery', desc: 'On orders above \u20b9499' },
    { title: 'Easy Returns', desc: '7-day return policy' },
    { title: '100% Original', desc: 'Genuine products only' },
    { title: 'Secure Payment', desc: 'Razorpay protected' },
  ]

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
        <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600" alt="Hero"
          className="w-full h-[70vh] md:h-[85vh] object-cover" />
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="px-6 lg:px-12 max-w-3xl">
            <span className="inline-block text-[10px] font-bold tracking-[2px] text-brand uppercase mb-4 bg-brand/10 px-3 py-1.5 rounded-md backdrop-blur">
              End of Season Sale
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-5">
              Style That<br />Speaks for<br />Itself.
            </h1>
            <p className="text-zinc-300 text-sm md:text-base max-w-md mb-7 leading-relaxed">
              Discover the latest trends with premium quality fabrics and unmatched comfort.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/products" className="inline-flex items-center gap-2 bg-white text-dark text-sm font-bold px-6 py-3 rounded-lg no-underline hover:bg-zinc-100 transition-colors">
                Shop Now
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="/products?category=women" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-sm font-semibold px-6 py-3 rounded-lg no-underline border border-white/20 hover:bg-white/20 transition-colors">
                Women's Collection
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Strip */}
      <section className="border-y border-border bg-zinc-50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {offers.map((o) => (
            <div key={o.title} className="flex items-center gap-3 px-5 py-4 md:px-8 md:py-5">
              <div className="w-0.5 h-7 bg-brand flex-shrink-0" />
              <div>
                <div className="text-xs md:text-sm font-bold text-dark">{o.title}</div>
                <div className="text-[11px] md:text-xs text-zinc-500 mt-0.5">{o.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 md:py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-dark tracking-tight">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map(cat => (
            <div key={cat.label} onClick={() => navigate(`/products?category=${cat.q}`)}
              className="relative rounded-xl overflow-hidden cursor-pointer group aspect-[4/5]">
              <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <span className="text-sm font-bold text-white">{cat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="pb-12 md:pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-dark tracking-tight">Trending Now</h2>
          <a href="/products" className="text-sm font-semibold text-brand no-underline hover:text-brand-dark transition-colors">
            View All &rarr;
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {trending.map((p, i) => (
            <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}
              className="group bg-white rounded-xl border border-border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] bg-zinc-50 relative overflow-hidden">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full bg-zinc-100" />}
                {i === 0 && (
                  <span className="absolute top-2.5 left-2.5 bg-brand text-white text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">TRENDING</span>
                )}
              </div>
              <div className="p-3 md:p-4">
                <h3 className="text-sm font-semibold text-dark mb-0.5 truncate">{p.name}</h3>
                <p className="text-xs text-zinc-400 mb-2 truncate">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-dark">₹{p.price}</span>
                  <span className={`text-[11px] font-semibold ${p.quantity > 0 ? 'text-emerald-600' : 'text-brand'}`}>
                    {p.quantity > 0 ? `${p.quantity} left` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
