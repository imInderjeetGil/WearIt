import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoSearch, IoBagOutline, IoPersonOutline, IoMenu, IoClose, IoHeartOutline } from 'react-icons/io5'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'
import useUiStore from '../../store/uiStore'
import { CATEGORIES } from '../../utils/constants'
import { isAuthenticated } from '../../utils/helpers'

const navLinks = [
  { label: "MEN", path: "/products" },
  { label: "NEW ARRIVALS", path: "/products?sort=-created_at" },
  { label: "TOPWEAR", path: "/products?category=topwear" },
  { label: "BOTTOMWEAR", path: "/products?category=bottomwear" },
  { label: "COLLECTIONS", path: "/products" },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const cartStore = useCartStore()
  const { searchOpen, openSearch, closeSearch, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUiStore()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery.trim()}`)
      closeSearch()
      setSearchQuery('')
    }
  }

  const totalItems = cartStore.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      {/* Top Bar */}
      <div className="hidden md:block bg-foreground text-white text-[10px] tracking-[0.2em] uppercase py-2 text-center">
        FREE SHIPPING ON ORDERS ABOVE ₹999 &middot; Easy 15-day returns &middot; Premium quality products
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Mobile Menu Toggle */}
            <button onClick={toggleMobileMenu} className="md:hidden p-2 -ml-2 cursor-pointer">
              {mobileMenuOpen ? <IoClose size={22} /> : <IoMenu size={22} />}
            </button>

            {/* Logo */}
            <Link
    to="/"
    className="absolute left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-black tracking-[0.45em] uppercase"
>
    WEARIT
</Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="
relative
text-[12px]
tracking-[0.22em]
font-semibold
uppercase
after:absolute
after:left-0
after:-bottom-2
after:h-[1px]
after:w-0
after:bg-black
after:transition-all
hover:after:w-full
"
                >
                  {link.label}
                </Link>
              ))}
              {/* Mega Menu Categories */}
              <div className="relative group">
                <button className="text-xs uppercase tracking-[0.15em] font-medium text-muted hover:text-foreground transition-colors cursor-pointer">
                  Categories
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white border border-border shadow-xl p-6 min-w-[400px]">
                    <div className="grid grid-cols-3 gap-4">
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.id}`}
                          className="group/cat"
                        >
                          <div className="aspect-[4/5] overflow-hidden bg-zinc-100 mb-2">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover/cat:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <p className="text-xs uppercase tracking-[0.15em] font-medium text-center">
                            {cat.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={openSearch} className="p-2 hover:bg-zinc-100 transition-colors cursor-pointer" aria-label="Search">
                <IoSearch size={20} />
              </button>

              {isAuthenticated() ? (
                <>
                  <Link to="/orders" className="hidden md:block p-2 hover:bg-zinc-100 transition-colors" aria-label="Orders">
                    <IoHeartOutline size={20} />
                  </Link>
                  <div className="relative">
                    <button onClick={() => cartStore.openCart()} className="p-2 hover:bg-zinc-100 transition-colors cursor-pointer" aria-label="Cart">
                      <IoBagOutline size={20} />
                    </button>
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white text-[9px] font-bold flex items-center justify-center">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </div>
                  {user?.role === 'admin' && (
                    <Link to="/admin/products" className="hidden md:block text-xs uppercase tracking-[0.15em] font-medium text-brand">
                      Admin
                    </Link>
                  )}
                  <button onClick={() => { logout(); navigate('/') }} className="hidden md:block text-xs uppercase tracking-[0.15em] font-medium text-muted hover:text-foreground cursor-pointer">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="p-2 hover:bg-zinc-100 transition-colors" aria-label="Account">
                    <IoPersonOutline size={20} />
                  </Link>
                  <Link to="/login" className="hidden md:block text-xs uppercase tracking-[0.15em] font-medium text-muted hover:text-foreground">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-border bg-white"
            >
              <div className="px-4 py-6 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className="block py-3 text-sm uppercase tracking-[0.15em] font-medium border-b border-border/50"
                  >
                    {link.label}
                  </Link>
                ))}
                <p className="py-3 text-xs uppercase tracking-[0.15em] font-medium text-muted pt-4">Categories</p>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      onClick={closeMobileMenu}
                      className="text-xs uppercase tracking-[0.1em] text-muted hover:text-foreground py-1"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <div className="pt-4 space-y-1 border-t border-border">
                  {isAuthenticated() ? (
                    <>
                      <Link to="/orders" onClick={closeMobileMenu} className="block py-3 text-sm uppercase tracking-[0.15em] font-medium">My Orders</Link>
                      <button onClick={() => { logout(); navigate('/'); closeMobileMenu() }} className="block py-3 text-sm uppercase tracking-[0.15em] font-medium text-brand cursor-pointer">
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={closeMobileMenu} className="block py-3 text-sm uppercase tracking-[0.15em] font-medium">Sign In</Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <div className="max-w-3xl mx-auto px-4 pt-20">
              <div className="flex items-center gap-4 mb-8">
                <form onSubmit={handleSearch} className="flex-1">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full text-2xl md:text-3xl font-light bg-transparent border-none outline-none placeholder:text-zinc-300"
                  />
                </form>
                <button onClick={closeSearch}
                className="text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground cursor-pointer">
                  Close
                </button>
              </div>
              <div className="mt-10">
  <p className="text-xs uppercase tracking-[0.25em] text-zinc-400 mb-5">
    Trending Searches
  </p>

  <div className="flex flex-wrap gap-3">
    {[
      "Oversized Tees",
      "Cargo Pants",
      "Linen Shirts",
      "Co-ords",
      "Jeans",
      "Polo T-Shirts",
    ].map((item) => (
      <button
        key={item}
        type="button"
        onClick={() => {
          setSearchQuery(item);
          navigate(`/products?search=${encodeURIComponent(item)}`);
          closeSearch();
        }}
        className="border border-zinc-300 px-5 py-2 text-sm uppercase tracking-wide transition-all duration-300 hover:bg-black hover:text-white hover:border-black cursor-pointer"
      >
        {item}
      </button>
    ))}
  </div>
</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
