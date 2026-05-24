import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  function checkAuth() {
    const token = localStorage.getItem("token")
    if (!token) { setIsLoggedIn(false); return }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setIsLoggedIn(true)
      setIsAdmin(payload.role === "admin")
    } catch (e) {
      localStorage.removeItem("token")
      setIsLoggedIn(false)
    }
  }

  function logout() {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    navigate("/")
    window.location.reload()
  }

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #e7e5e4', height: '64px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Brand */}
        <a href="/" style={{ fontSize: '24px', fontWeight: '900', color: '#1a1a2e', textDecoration: 'none' }}>
          Wear<span style={{ color: '#f43f5e' }}>It</span>
        </a>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="/" style={{ color: '#78716c', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Home</a>
          <a href="/products" style={{ color: '#78716c', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Shop</a>

          {isLoggedIn ? (
            <>
              {!isAdmin && (
                <a href="/cart" style={{ color: '#78716c', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Cart</a>
              )}
              {isAdmin && (
                <a href="/admin/products" style={{ color: '#78716c', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Manage Product</a>
              )}
              <a href={isAdmin ? "/admin/orders" : "/orders"} style={{ color: '#78716c', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Orders</a>
              <button onClick={logout}
                style={{ backgroundColor: '#1a1a2e', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" style={{ color: '#78716c', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Login</a>
              <a href="/register" style={{ backgroundColor: '#f43f5e', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '700' }}>
                Register
              </a>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}

export default Navbar