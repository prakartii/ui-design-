import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const CREATOR_NAV = [
  { path: '/creator/dashboard', label: 'Dashboard', icon: '◈' },
  { path: '/creator/voice-archaeology', label: 'Voice Archaeology', icon: '◉' },
  { path: '/creator/brief-translator', label: 'Brief Translator', icon: '⇄' },
  { path: '/creator/creator-match', label: 'Creator Match', icon: '◎' },
  { path: '/creator/rejection-prevention', label: 'Rejection Prevention', icon: '⬡' },
  { path: '/creator/living-brief', label: 'Living Brief', icon: '↗' },
  { path: '/creator/pixel-pact', label: 'Pixel Pact', icon: '⬢' },
  { path: '/creator/brand-discovery', label: 'Brand Discovery', icon: '⊕' },
]

const BRAND_NAV = [
  { path: '/brand/dashboard', label: 'Dashboard', icon: '◈' },
  { path: '/brand/campaigns', label: 'Campaigns', icon: '⬡' },
  { path: '/brand/creators', label: 'Creators', icon: '◉' },
  { path: '/brand/analytics', label: 'Analytics', icon: '↗' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = user?.role === 'creator' ? CREATOR_NAV : BRAND_NAV
  const initial = user?.name?.[0]?.toUpperCase() ?? '?'

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-studio-brd shrink-0">
        <button
          onClick={() => navigate('/')}
          className="font-serif text-sm tracking-[0.2em] text-white/60 hover:text-white transition-colors select-none"
        >
          INTENT
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-white/30 hover:text-white/60 transition-colors text-lg leading-none"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-studio-brd shrink-0">
        <span className="label-caps text-ember-400/60">
          {user?.role === 'creator' ? 'Creator' : 'Brand'} Portal
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-studio-ele text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-studio-ele/50'
              }`
            }
          >
            <span className="text-[14px] shrink-0 font-mono">{item.icon}</span>
            <span className="font-sans text-[13px] font-medium truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-studio-brd p-4 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ember-400 to-ember-800 flex items-center justify-center text-white font-serif text-sm shrink-0 select-none">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-sans text-[12px] font-medium text-white/80 truncate">
              {user?.name}
            </div>
            <div className="font-sans text-[10px] text-white/30 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left font-sans text-[11px] text-white/25 hover:text-white/55 transition-colors duration-150 py-1"
        >
          Sign out →
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0C0B09' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-56 shrink-0 flex-col border-r border-studio-brd"
        style={{ background: '#0C0B09' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-56 lg:hidden border-r border-studio-brd"
              style={{ background: '#0C0B09' }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 flex items-center justify-between px-5 lg:px-6 border-b border-studio-brd shrink-0"
          style={{ background: '#0C0B09' }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex flex-col gap-1.5 p-1 mr-1"
              aria-label="Open menu"
            >
              <span className="block w-5 h-px bg-white/50" />
              <span className="block w-5 h-px bg-white/50" />
              <span className="block w-5 h-px bg-white/50" />
            </button>
            <span className="font-sans text-[13px] text-white/30">
              Welcome back,{' '}
              <span className="text-white/60 font-medium">{user?.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-sans text-[11px] text-white/25 hidden sm:block">
                All systems live
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
