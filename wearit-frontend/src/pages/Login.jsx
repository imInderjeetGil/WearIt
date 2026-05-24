import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE from '../config'

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : "Invalid credentials")
      } else {
        localStorage.setItem("token", data.access_token)
        window.location.href = "/"
      }
    } catch (e) {
      setError("Something went wrong. Try again.")
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#f5f5f6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#1a1a2e' }}>Wear<span style={{ color: '#f43f5e' }}>It</span></div>
          <p style={{ color: '#a8a8b3', fontSize: '14px', marginTop: '8px' }}>Login to your account</p>
        </div>

        <div style={{ background: 'white', borderRadius: '8px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          {error && (
            <div style={{ background: '#fff0f3', border: '1px solid #fecdd3', color: '#f43f5e', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px', letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', border: '2px solid #ebebeb', padding: '10px 14px', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px', letterSpacing: '0.5px' }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyUp={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', border: '2px solid #ebebeb', padding: '10px 14px', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', background: '#f43f5e', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', letterSpacing: '0.5px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "LOGGING IN..." : "LOGIN →"}
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#7e7e7e' }}>
            Don't have an account?{' '}
            <a href="/register" style={{ color: '#f43f5e', fontWeight: '800', textDecoration: 'none' }}>Register</a>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Login