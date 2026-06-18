import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types'

const ease = [0.16, 1, 0.3, 1] as const

export default function SignupPage() {
  const { user, signup } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('creator')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      const newUser = await signup(name, email, password, role)
      navigate(newUser.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard', {
        replace: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-14 relative overflow-hidden"
      style={{ background: '#0C0B09' }}
    >
      {/* Background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 700,
          height: 700,
          left: '20%',
          top: '5%',
          background: 'radial-gradient(circle, #D97C28 0%, transparent 70%)',
          opacity: 0.05,
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
          <h1 className="font-serif font-light text-display-s text-white mb-2">
            Create your account
          </h1>
          <p className="font-sans text-[14px] text-white/35">
            Join the creator intelligence platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role picker */}
          <div>
            <label className="label-caps text-white/30 block mb-2">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {(['creator', 'brand'] as UserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-3 rounded-lg border font-sans text-[13px] font-medium transition-all duration-150 ${
                    role === r
                      ? 'bg-ember-600 border-ember-600 text-white'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                  style={role !== r ? { background: '#1C1A17', borderColor: '#2A2722' } : {}}
                >
                  {r === 'creator' ? '✦ Creator' : '◈ Brand'}
                </button>
              ))}
            </div>
            <p className="font-sans text-[11px] text-white/20 mt-2">
              {role === 'creator'
                ? 'Access all 7 creator intelligence tools.'
                : 'Discover and manage creator partnerships.'}
            </p>
          </div>

          <div>
            <label className="label-caps text-white/30 block mb-2">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={role === 'creator' ? 'Your name or handle' : 'Brand or team name'}
              className="w-full rounded-lg px-4 py-3 font-sans text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-ember-600 transition-colors duration-200 border"
              style={{ background: '#1C1A17', borderColor: '#2A2722' }}
            />
          </div>

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
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
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
            {loading ? 'Creating account…' : 'Get started free →'}
          </button>
        </form>

        <p className="font-sans text-[11px] text-white/15 mt-4 text-center">
          No credit card required.
        </p>

        <p className="font-sans text-[13px] text-white/25 mt-5 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-ember-400 hover:text-ember-200 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
