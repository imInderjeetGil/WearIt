import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchActive, setSearchActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("")
  const [sort, setSort] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  function checkAuth() {
    const token = localStorage.getItem("token")
    if (!token) { setIsLoggedIn(false); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setIsLoggedIn(true)
      setIsAdmin(payload.role === "admin")
    } catch {
      localStorage.removeItem("token")
      setIsLoggedIn(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  function logout() {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    navigate("/")
    window.location.reload()
  }

  function handleSearch(e) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      let url = `/products?search=${searchQuery}`
      if (category) url += `&category=${category}`
      if (sort) url += `&sort=${sort}`
      navigate(url)
      setSearchActive(false)
    }
  }

  function closeSearch() {
    setSearchActive(false)
    setSearchQuery("")
    setCategory("")
    setSort("")
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      {/* Desktop Nav */}
      <div className="hidden md:flex items-center justify-between h-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-dark no-underline flex-shrink-0">
          Wear<span className="text-brand">It</span>
        </Link>

        {searchActive ? (
          <div className="flex items-center gap-3 flex-1 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center gap-2 bg-zinc-50 border-2 border-brand rounded-lg px-4 h-10">
              <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch}
                placeholder="Search products..." className="flex-1 border-none bg-transparent outline-none text-sm text-dark" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="text-xs font-medium text-zinc-600 border border-border rounded-md px-3 py-2 bg-white">
              <option value="">All</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
            </select>
            <button onClick={closeSearch} className="text-zinc-400 hover:text-zinc-600 p-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-8">
            <Link to="/" className={`text-sm font-medium no-underline transition-colors ${isActive('/') ? 'text-dark' : 'text-zinc-500 hover:text-dark'}`}>Home</Link>
            <Link to="/products" className={`text-sm font-medium no-underline transition-colors ${isActive('/products') ? 'text-dark' : 'text-zinc-500 hover:text-dark'}`}>Products</Link>

            {isLoggedIn && isAdmin && (
              <Link to="/admin/products" className="text-xs font-semibold text-brand bg-rose-50 border border-brand-light rounded-md px-3 py-1.5 no-underline">
                Admin Panel
              </Link>
            )}
            {isLoggedIn && !isAdmin && (
              <Link to="/orders" className={`text-sm font-medium no-underline transition-colors ${isActive('/orders') ? 'text-dark' : 'text-zinc-500 hover:text-dark'}`}>My Orders</Link>
            )}
            {isLoggedIn && isAdmin && (
              <Link to="/admin/orders" className={`text-sm font-medium no-underline transition-colors ${isActive('/admin/orders') ? 'text-dark' : 'text-zinc-500 hover:text-dark'}`}>All Orders</Link>
            )}

            <div className="w-px h-4 bg-border" />

            <button onClick={() => setSearchActive(true)} className="text-zinc-500 hover:text-dark p-1 transition-colors" aria-label="Search">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-6">
                {!isAdmin && (
                  <Link to="/cart" className={`flex items-center gap-1.5 text-sm font-medium no-underline transition-colors ${isActive('/cart') ? 'text-dark' : 'text-zinc-500 hover:text-dark'}`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                    Bag
                  </Link>
                )}
                <div className="w-px h-4 bg-border" />
                <button onClick={logout} className="text-sm font-medium text-zinc-500 hover:text-dark transition-colors bg-none border-none cursor-pointer">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-zinc-600 no-underline px-4 py-2 border border-border rounded-lg hover:border-zinc-400 transition-colors">Login</Link>
                <Link to="/register" className="text-sm font-semibold text-white bg-dark no-underline px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between h-14 px-4">
        <Link to="/" className="text-lg font-extrabold tracking-tight text-dark no-underline">
          Wear<span className="text-brand">It</span>
        </Link>

        <div className="flex items-center gap-3">
          <button onClick={() => setSearchActive(true)} className="text-zinc-500 p-1" aria-label="Search">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <Link to="/cart" className="text-zinc-500 p-1">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-500 p-1">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {searchActive && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-white border-b border-border px-4 py-3 z-50">
          <div className="flex items-center gap-2 bg-zinc-50 border-2 border-brand rounded-lg px-3 h-10">
            <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
              placeholder="Search products..." className="flex-1 border-none bg-transparent outline-none text-sm text-dark" />
            <button onClick={closeSearch} className="text-zinc-400 p-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-white border-b border-border z-50 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors ${isActive('/') ? 'bg-zinc-100 text-dark' : 'text-zinc-600 hover:bg-zinc-50'}`}>Home</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors ${isActive('/products') ? 'bg-zinc-100 text-dark' : 'text-zinc-600 hover:bg-zinc-50'}`}>Products</Link>
            {isLoggedIn && !isAdmin && (
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors ${isActive('/orders') ? 'bg-zinc-100 text-dark' : 'text-zinc-600 hover:bg-zinc-50'}`}>My Orders</Link>
            )}
            {isLoggedIn && isAdmin && (
              <>
                <Link to="/admin/products" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors ${isActive('/admin/products') ? 'bg-zinc-100 text-dark' : 'text-zinc-600 hover:bg-zinc-50'}`}>Manage Products</Link>
                <Link to="/admin/orders" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors ${isActive('/admin/orders') ? 'bg-zinc-100 text-dark' : 'text-zinc-600 hover:bg-zinc-50'}`}>All Orders</Link>
              </>
            )}
            {isLoggedIn ? (
              <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors bg-none border-none cursor-pointer">
                Logout
              </button>
            ) : (
              <>
                <div className="border-t border-border my-2" />
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors ${isActive('/login') ? 'bg-zinc-100 text-dark' : 'text-zinc-600 hover:bg-zinc-50'}`}>Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors ${isActive('/register') ? 'bg-zinc-100 text-dark' : 'text-zinc-600 hover:bg-zinc-50'}`}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 flex items-center justify-around h-16 pb-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 4px)' }}>
        <Link to="/" className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium no-underline transition-colors ${isActive('/') ? 'text-brand' : 'text-zinc-400'}`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Home</span>
        </Link>

        <Link to="/products" className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium no-underline transition-colors ${isActive('/products') ? 'text-brand' : 'text-zinc-400'}`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>Shop</span>
        </Link>

        {!isAdmin && (
          <Link to="/cart" className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium no-underline transition-colors ${isActive('/cart') ? 'text-brand' : 'text-zinc-400'}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span>Bag</span>
          </Link>
        )}

        {isLoggedIn ? (
          <Link to={isAdmin ? "/admin/products" : "/orders"} className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium no-underline transition-colors ${isActive('/orders') || isActive('/admin/products') ? 'text-brand' : 'text-zinc-400'}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span>{isAdmin ? 'Admin' : 'Profile'}</span>
          </Link>
        ) : (
          <Link to="/login" className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium no-underline transition-colors ${isActive('/login') ? 'text-brand' : 'text-zinc-400'}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h4M10 17l5-5-5-5M13 12H3"/>
            </svg>
            <span>Login</span>
          </Link>
        )}
      </nav>
    </header>
  )
}

export default Navbar
