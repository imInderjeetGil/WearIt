import { Link } from 'react-router-dom'

function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-dark mb-3">Order Placed!</h1>
        <p className="text-sm text-zinc-500 leading-relaxed mb-8">
          Thank you for shopping at <strong className="text-dark">WearIt</strong>!<br />Your order is being processed.
        </p>

        <div className="bg-white rounded-2xl border border-border p-5 mb-8 text-left">
          {[
            { icon: '\uD83D\uDCE6', text: 'Order is being processed' },
            { icon: '\uD83D\uDE9A', text: 'Delivery within 2-3 business days' },
            { icon: '\uD83D\uDCE7', text: 'Confirmation sent to your email' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm text-zinc-500">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="bg-dark text-white text-sm font-bold px-8 py-3.5 rounded-xl no-underline hover:bg-zinc-800 transition-colors">
            View Orders
          </Link>
          <Link to="/products" className="bg-brand text-white text-sm font-bold px-8 py-3.5 rounded-xl no-underline hover:bg-brand-dark transition-colors">
            Shop More &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
