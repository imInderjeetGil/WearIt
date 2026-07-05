import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API_BASE from '../config'

function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleRegister() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || "Registration failed")
      } else {
        navigate("/login")
      }
    } catch {
      setError("Something went wrong. Try again.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-black text-dark no-underline">Wear<span className="text-brand">It</span></Link>
          <p className="text-sm text-zinc-500 mt-2">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-brand text-sm font-semibold px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-[11px] font-bold text-dark uppercase tracking-wider mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Aman Gill"
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-400 transition-colors" />
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-bold text-dark uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-400 transition-colors" />
          </div>

          <div className="mb-6">
            <label className="block text-[11px] font-bold text-dark uppercase tracking-wider mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
              onKeyUp={e => e.key === 'Enter' && handleRegister()}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-400 transition-colors" />
          </div>

          <button onClick={handleRegister} disabled={loading}
            className="w-full bg-brand text-white text-sm font-bold py-3 rounded-xl transition-all disabled:opacity-60 hover:bg-brand-dark cursor-pointer border-none tracking-wide">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center mt-5 text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-semibold no-underline hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
