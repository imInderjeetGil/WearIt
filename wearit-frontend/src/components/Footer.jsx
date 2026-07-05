import { Link } from 'react-router-dom'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-border md:pb-0 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-extrabold tracking-tight text-dark no-underline block mb-3">
              Wear<span className="text-brand">It</span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-56">
              Fresh styles, everyday essentials. Shop the latest fashion at the best prices — only on WearIt.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-dark uppercase tracking-wider mb-4">Shop</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/products" className="text-sm text-zinc-500 no-underline hover:text-dark transition-colors">All Products</Link>
              <Link to="/products?category=men" className="text-sm text-zinc-500 no-underline hover:text-dark transition-colors">Men</Link>
              <Link to="/products?category=women" className="text-sm text-zinc-500 no-underline hover:text-dark transition-colors">Women</Link>
              <Link to="/products?category=kids" className="text-sm text-zinc-500 no-underline hover:text-dark transition-colors">Kids</Link>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-dark uppercase tracking-wider mb-4">Account</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/orders" className="text-sm text-zinc-500 no-underline hover:text-dark transition-colors">My Orders</Link>
              <Link to="/cart" className="text-sm text-zinc-500 no-underline hover:text-dark transition-colors">Cart</Link>
              <Link to="/login" className="text-sm text-zinc-500 no-underline hover:text-dark transition-colors">Login</Link>
              <Link to="/register" className="text-sm text-zinc-500 no-underline hover:text-dark transition-colors">Register</Link>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[11px] font-bold text-dark uppercase tracking-wider mb-4">Support</h4>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-sm text-zinc-500 no-underline hover:text-dark transition-colors">Returns Policy</a>
              <a href="#" className="text-sm text-zinc-500 no-underline hover:text-dark transition-colors">Shipping Info</a>
              <a href="#" className="text-sm text-zinc-500 no-underline hover:text-dark transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-zinc-500 no-underline hover:text-dark transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-zinc-400">&copy; {year} WearIt. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-zinc-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
