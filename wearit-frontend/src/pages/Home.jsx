import { useState, useEffect, useRef } from 'react'
import API_BASE from '../config'

function Home() {
  const [trending, setTrending] = useState([])
  const [current, setCurrent] = useState(0)
  const sliderRef = useRef(null)

  // 1. Gradients ki jagah Images use kari, par text clear dikhe isliye halka sa dark overlay (rgba) add kiya hai
  const banners = [
    { 
      bgImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600')", // Fashion Banner
      tag: 'END OF SEASON SALE', 
      title: 'UP TO 70% OFF', 
      sub: 'Freshest styles. Lowest prices. Only on WearIt.' 
    },
    { 
      bgImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600')", // New Arrivals
      tag: 'NEW ARRIVALS', 
      title: 'FRESH DROPS', 
      sub: 'Brand new styles added every week. Shop before they sell out.' 
    },
    { 
      bgImage: "url('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1600')", // Ethnic Wear
      tag: 'ETHNIC WEAR', 
      title: 'FESTIVE SPECIAL', 
      sub: 'Celebrate in style with our exclusive ethnic collection.' 
    },
  ]

  useEffect(() => {
    fetch(`${API_BASE}/products/?limit=8`)
      .then(res => res.json())
      .then(data => setTrending(data))
  }, [])

  // Auto scroll banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ background: '#f5f5f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Hero Banner - Auto Scroll */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '420px' }}>
        {banners.map((banner, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            // Linear Gradient overlay banaya taaki white text image ke upar dundhla na ho
            backgroundImage: `linear-gradient(90deg, rgba(26, 26, 46, 0.9) 40%, rgba(26, 26, 46, 0.4) 100%), ${banner.bgImage}`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            padding: '60px 80px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            opacity: current === i ? 1 : 0,
            transform: current === i ? 'scale(1)' : 'scale(1.05)', // Sweet zooming effect transition
            transition: 'opacity 0.8s ease, transform 0.8s ease',
            pointerEvents: current === i ? 'auto' : 'none',
            zIndex: current === i ? 1 : 0
          }}>
            <div style={{ maxWidth: '600px' }}>
              <div style={{ background: '#f43f5e', display: 'inline-block', color: 'white', fontSize: '11px', fontWeight: '800', letterSpacing: '2px', padding: '5px 14px', borderRadius: '4px', marginBottom: '20px' }}>
                {banner.tag}
              </div>
              <h1 style={{ fontSize: '56px', fontWeight: '900', color: 'white', lineHeight: '1.1', marginBottom: '12px', textShadow: '1px 1px 10px rgba(0,0,0,0.5)' }}>
                {banner.title}
              </h1>
              <p style={{ color: '#e2e2e9', fontSize: '18px', marginBottom: '32px', textShadow: '1px 1px 5px rgba(0,0,0,0.5)' }}>{banner.sub}</p>
              <a href="/products" style={{ background: 'white', color: '#1a1a2e', padding: '14px 36px', borderRadius: '4px', fontWeight: '800', fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', transition: '0.2s' }}>
                SHOP NOW
              </a>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
          {banners.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)}
              style={{ width: current === i ? '24px' : '8px', height: '8px', borderRadius: '4px', background: current === i ? '#f43f5e' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.3s ease' }} />
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ background: 'white', padding: '24px 80px', display: 'flex', gap: '16px', overflowX: 'auto', borderBottom: '1px solid #ebebeb' }}>
        {[
          { label: "Men", emoji: "👔" },
          { label: "Women", emoji: "👗" },
          { label: "Kids", emoji: "🧒" },
          { label: "Ethnic", emoji: "🥻" },
          { label: "Sports", emoji: "🏃" },
          { label: "Accessories", emoji: "👜" },
        ].map((cat) => (
          <div key={cat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '72px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff0f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', border: '2px solid #ffe4e6' }}>
              {cat.emoji}
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#3d3d3d' }}>{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Offers Strip */}
      <div style={{ background: 'white', margin: '16px 80px', borderRadius: '8px', padding: '20px 32px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {[
          { icon: '🚚', title: 'FREE DELIVERY', desc: 'On orders above ₹499' },
          { icon: '↩️', title: 'EASY RETURNS', desc: '7-day return policy' },
          { icon: '✅', title: '100% ORIGINAL', desc: 'Genuine products only' },
          { icon: '🔒', title: 'SECURE PAYMENT', desc: 'Razorpay protected' },
        ].map((item) => (
          <div key={item.title} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#1a1a2e', letterSpacing: '0.5px' }}>{item.title}</div>
              <div style={{ fontSize: '12px', color: '#7e7e7e' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Trending Section */}
      <div style={{ padding: '32px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e' }}>TRENDING NOW</h2>
          <a href="/products" style={{ fontSize: '13px', fontWeight: '700', color: '#f43f5e', textDecoration: 'none' }}>VIEW ALL →</a>
        </div>

        {/* Auto Scroll Product Slider */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div ref={sliderRef} style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollBehavior: 'smooth', paddingBottom: '8px', scrollbarWidth: 'none' }}>
            {trending.map((p) => (
              <div key={p.id}
                onClick={() => window.location.href = `/product/${p.id}`}
                style={{ minWidth: '220px', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ height: '220px', background: '#fff0f3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '60px' }}>👕</span>}
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#1a1a2e' }}>₹{p.price}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Arrows */}
          <button onClick={() => sliderRef.current.scrollBy({ left: -500, behavior: 'smooth' })}
            style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ←
          </button>
          <button onClick={() => sliderRef.current.scrollBy({ left: 500, behavior: 'smooth' })}
            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            →
          </button>
        </div>
      </div>

    </div>
  )
}

export default Home