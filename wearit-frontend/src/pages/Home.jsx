function Home() {
  const categories = [
    { label: "Men", emoji: "👔" },
    { label: "Women", emoji: "👗" },
    { label: "Kids", emoji: "🧒" },
    { label: "Ethnic", emoji: "🥻" },
    { label: "Sports", emoji: "🏃" },
    { label: "Accessories", emoji: "👜" },
  ]

  return (
    <div style={{ background: '#f5f5f6', minHeight: '100vh' }}>

      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(120deg, #1a1a2e 60%, #f43f5e 100%)', padding: '60px 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        <div>
          <div style={{ background: '#f43f5e', display: 'inline-block', color: 'white', fontSize: '11px', fontWeight: '800', letterSpacing: '2px', padding: '5px 14px', borderRadius: '4px', marginBottom: '20px' }}>
            END OF SEASON SALE
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: '900', color: 'white', lineHeight: '1.1', marginBottom: '12px' }}>
            UP TO <span style={{ color: '#f43f5e' }}>70% OFF</span>
          </h1>
          <p style={{ color: '#a8a8b3', fontSize: '16px', marginBottom: '32px' }}>
            Freshest styles. Lowest prices. Only on WearIt.
          </p>
          <a href="/products" style={{ background: 'white', color: '#1a1a2e', padding: '14px 36px', borderRadius: '4px', fontWeight: '800', fontSize: '15px', textDecoration: 'none', letterSpacing: '0.5px' }}>
            SHOP NOW
          </a>
        </div>

        <div style={{ fontSize: '140px', lineHeight: 1 }}>👗</div>

      </div>

      {/* Category Pills */}
      <div style={{ background: 'white', padding: '24px 80px', display: 'flex', gap: '16px', overflowX: 'auto', borderBottom: '1px solid #ebebeb' }}>
        {categories.map((cat) => (
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

        {/* Placeholder product cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {['👕 Men Casual Tee', '👗 Floral Dress', '🧥 Winter Jacket', '👖 Slim Jeans'].map((item, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
              <div style={{ height: '220px', background: `hsl(${i * 60}, 80%, 92%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px' }}>
                {item.split(' ')[0]}
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>{item.slice(2)}</div>
                <div style={{ fontSize: '13px', color: '#f43f5e', fontWeight: '800' }}>₹599 <span style={{ color: '#a8a8b3', fontWeight: '400', textDecoration: 'line-through', fontSize: '12px' }}>₹1299</span></div>
                <div style={{ fontSize: '11px', color: '#2ecc71', fontWeight: '700' }}>54% OFF</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Home