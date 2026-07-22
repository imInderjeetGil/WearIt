import { Link } from 'react-router-dom'
import { IoLogoInstagram, IoLogoTwitter, IoLogoFacebook, IoLogoYoutube } from 'react-icons/io5'

export default function Footer() {
  return (
    <footer className="bg-foreground text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-display font-bold text-white">
              Wear<span className="text-brand">It</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Premium fashion for the modern individual. Curated collections that define your style.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><IoLogoInstagram size={18} /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><IoLogoTwitter size={18} /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><IoLogoFacebook size={18} /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><IoLogoYoutube size={18} /></a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {['All Products', 'New Arrivals', 'Men', 'Women', 'Kids', 'Sale'].map((item) => (
                <li key={item}>
                  <Link to="/products" className="text-sm hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2.5">
              {['My Account', 'My Orders', 'Wishlist', 'Cart'].map((item) => (
                <li key={item}>
                  <Link to={item === 'Cart' ? '/cart' : item === 'My Orders' ? '/orders' : '/login'} className="text-sm hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2.5">
              {['Contact Us', 'FAQs', 'Shipping', 'Returns', 'Size Guide'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>&copy; 2026 WearIt. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
