import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const ease = [0.16, 1, 0.3, 1] as const

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname

  useEffect(() => {
    if (user) {
      navigate(user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard', {
        replace: true,
      })
    }
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const loggedIn = await login(email, password)
      const dest = from || (loggedIn.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard')
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#0C0B09' }}
    >
      {/* Subtle background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          left: '30%',
          top: '10%',
          background: 'radial-gradient(circle, #F5A653 0%, transparent 70%)',
          opacity: 0.04,
          filter: 'blur(80px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="w-full max-w-sm relative z-10"
      >
        <Link
          to="/"
          className="font-serif text-sm tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors block mb-12"
        >
          INTENT
        </Link>

        <div className="mb-8">
          <h1 className="font-serif font-light text-display-s text-white mb-2">Sign in</h1>
          <p className="font-sans text-[14px] text-white/35">
            Continue to your workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-caps text-white/30 block mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg px-4 py-3 font-sans text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-ember-600 transition-colors duration-200 border"
              style={{ background: '#1C1A17', borderColor: '#2A2722' }}
            />
          </div>

          <div>
            <label className="label-caps text-white/30 block mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg px-4 py-3 font-sans text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-ember-600 transition-colors duration-200 border"
              style={{ background: '#1C1A17', borderColor: '#2A2722' }}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-sans text-[13px] text-red-400 rounded-lg px-4 py-3 border border-red-900/40"
              style={{ background: 'rgba(127,29,29,0.2)' }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ember-600 hover:bg-ember-800 text-white font-sans text-sm font-medium py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p className="font-sans text-[13px] text-white/25 mt-6 text-center">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-ember-400 hover:text-ember-200 transition-colors">
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
