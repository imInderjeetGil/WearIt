function PaymentSuccess() {
  return (
    <div style={{ background: '#f5f5f6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>

        <div style={{ width: '90px', height: '90px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '40px' }}>
          ✓
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1a1a2e', marginBottom: '12px' }}>Order Placed! 🎉</h1>
        <p style={{ color: '#7e7e7e', fontSize: '15px', lineHeight: '1.8', marginBottom: '32px' }}>
          Thank you for shopping at <strong>WearIt</strong>!<br />Your order is being processed.
        </p>

        <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {[
            { icon: '📦', text: 'Order is being processed' },
            { icon: '🚚', text: 'Delivery within 2-3 business days' },
            { icon: '📧', text: 'Confirmation sent to your email' },
          ].map((item) => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f5f5f6' }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px', color: '#7e7e7e' }}>{item.text}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <a href="/orders" style={{ background: '#1a1a2e', color: 'white', padding: '12px 28px', borderRadius: '4px', fontWeight: '800', textDecoration: 'none', fontSize: '14px' }}>
            VIEW ORDERS
          </a>
          <a href="/products" style={{ background: '#f43f5e', color: 'white', padding: '12px 28px', borderRadius: '4px', fontWeight: '800', textDecoration: 'none', fontSize: '14px' }}>
            SHOP MORE →
          </a>
        </div>

      </div>
    </div>
  )
}

export default PaymentSuccess