import { useState, useEffect, useRef, type ReactNode } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1] as const

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ─── Navigation ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'archaeology', label: 'Voice' },
  { id: 'translator', label: 'Translate' },
  { id: 'match', label: 'Match' },
  { id: 'rejection', label: 'Studio' },
  { id: 'living', label: 'Living Brief' },
  { id: 'pixel', label: 'Pixel Pact' },
  { id: 'discovery', label: 'Discover' },
]

function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-studio-bg/95 backdrop-blur-xl border-b border-studio-brd' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-serif text-sm tracking-[0.2em] text-white select-none"
          >
            INTENT
          </button>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="px-3 py-1.5 font-sans text-[13px] font-medium text-white/45 hover:text-white/90 transition-colors duration-200 rounded-md hover:bg-white/6"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="font-sans text-[13px] font-medium text-white/35 hover:text-white/70 transition-colors duration-200">
              Sign in
            </button>
            <button className="font-sans text-sm font-medium bg-ember-600 hover:bg-ember-800 text-white px-5 py-2.5 rounded-md transition-colors duration-200">
              Get early access →
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(o => !o)}
            className="lg:hidden p-2 flex flex-col gap-1.5"
            aria-label="Toggle menu"
          >
            <motion.span animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block w-5 h-px bg-white" />
            <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} className="block w-5 h-px bg-white" />
            <motion.span animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block w-5 h-px bg-white" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-studio-bg flex flex-col items-center justify-center gap-7"
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, ease }}
                onClick={() => { scrollTo(item.id); setMobileOpen(false) }}
                className="font-serif text-3xl font-light text-white hover:text-ember-400 transition-colors"
              >
                {item.label}
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, ease }}
              className="mt-4 font-sans text-sm font-medium bg-ember-600 text-white px-8 py-3 rounded-md"
            >
              Get early access →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Mini Ring SVG ────────────────────────────────────────────────────────────

function MiniRing({ score, size = 44, color = '#F5A653' }: { score: number; size?: number; color?: string }) {
  const r = size / 2 - 4
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2A2722" strokeWidth="2.5" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.6, delay: 0.9, ease }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fill="white" fontSize={size * 0.21} fontWeight="600" fontFamily="Inter, sans-serif">
        {score}%
      </text>
    </svg>
  )
}

// ─── Hero Floating Cards ──────────────────────────────────────────────────────

function CardMatchBadge() {
  return (
    <div className="bg-studio-card border border-studio-brd rounded-xl p-3.5 flex items-center gap-3" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <MiniRing score={87} size={44} />
      <div>
        <div className="label-caps text-white/25 mb-0.5">Voice Match</div>
        <div className="font-sans text-[13px] font-semibold text-white">Nike × @sarah_runs</div>
        <div className="font-sans text-[11px] text-ember-400 mt-0.5">87% · Strong alignment</div>
      </div>
    </div>
  )
}

function CardBriefPreview() {
  return (
    <div className="bg-studio-card border border-studio-brd rounded-2xl p-5 w-72" style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
      <div className="flex items-center justify-between mb-4">
        <span className="label-caps text-white/30">Brief Translator</span>
        <span className="label-caps text-ember-400/70">Nike</span>
      </div>
      <div className="bg-studio-ele rounded-lg px-3.5 py-3 mb-3.5">
        <p className="font-mono text-[11px] text-white/35 leading-relaxed">
          "authentic, community-driven content that shows real performance..."
        </p>
      </div>
      <div className="flex items-center gap-2 mb-3.5">
        <div className="h-px flex-1 bg-studio-brd" />
        <span className="font-sans text-[10px] text-white/20">AI translation</span>
        <div className="h-px flex-1 bg-studio-brd" />
      </div>
      <div className="space-y-2">
        {[
          { ok: true, text: 'Open with physical struggle' },
          { ok: true, text: 'Product at peak achievement' },
          { ok: false, text: 'Avoid comfort language' },
        ].map(item => (
          <div key={item.text} className="flex items-center gap-2.5">
            <span className={`text-[11px] font-semibold ${item.ok ? 'text-emerald-400' : 'text-red-400'}`}>{item.ok ? '✓' : '✗'}</span>
            <span className="font-sans text-[12px] text-white/55">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CardRiskBadge() {
  return (
    <div className="rounded-xl px-4 py-3.5" style={{ background: 'rgba(127,29,29,0.7)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <div className="label-caps mb-1" style={{ color: 'rgba(252,165,165,0.5)' }}>Rejection Risk</div>
      <div className="font-serif text-3xl font-light text-red-300">78%</div>
      <div className="font-sans text-[11px] mt-1" style={{ color: 'rgba(252,165,165,0.7)' }}>3 Critical · 3 High issues</div>
      <div className="font-sans text-[10px] mt-2" style={{ color: 'rgba(252,165,165,0.35)' }}>Apply AI fixes → 91% approval</div>
    </div>
  )
}

function CardLivingBrief() {
  const [count, setCount] = useState(3)
  useEffect(() => {
    const t = setInterval(() => setCount(c => c >= 5 ? 3 : c + 1), 3800)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="bg-studio-card border border-studio-brd rounded-xl px-4 py-3.5 flex items-center gap-3" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <div className="relative shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
      </div>
      <div>
        <div className="label-caps text-white/25 mb-0.5">Living Brief</div>
        <div className="font-sans text-[13px] font-medium text-white">Nike · Air Max '25</div>
        <div className="font-sans text-[11px] text-white/35 mt-0.5">
          <AnimatePresence mode="wait">
            <motion.span key={count} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {count} updates today
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function CardDiscovery() {
  return (
    <div className="bg-studio-card border border-studio-brd rounded-xl px-4 py-3.5" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <div className="label-caps text-white/25 mb-1.5">Brand Discovery</div>
      <div className="font-serif text-[28px] font-light text-white leading-none">12</div>
      <div className="font-sans text-[11px] text-white/35 mt-1">brands match your voice</div>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="min-h-screen bg-studio-bg relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,166,83,0.035) 0%, transparent 65%)' }} />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 min-h-screen grid lg:grid-cols-[5fr_6fr] gap-12 lg:gap-16 items-center pt-24 pb-20">

        {/* Left — copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            <span className="label-caps text-ember-400/70">Creator Intelligence Platform</span>
          </motion.div>

          <div className="mt-5">
            {['The intelligence', 'layer between', 'creators and brands.'].map((line, i) => (
              <div key={line} className="overflow-hidden">
                <motion.h1
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.75, delay: 0.2 + i * 0.1, ease }}
                  className="font-serif font-light text-display-xl text-white leading-none"
                >
                  {line}
                </motion.h1>
              </div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.62, ease }}
            className="mt-8 font-sans text-[15px] text-white/45 max-w-[400px] leading-[1.85]"
          >
            Intent analyzes thousands of approved campaigns to tell creators exactly what each brand actually wants — then helps them make it, verify it, and get paid for it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.82, ease }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button className="font-sans text-sm font-medium bg-ember-600 hover:bg-ember-800 text-white px-7 py-3 rounded-md transition-colors duration-200">
              Start free →
            </button>
            <button
              onClick={() => scrollTo('archaeology')}
              className="font-sans text-[13px] font-medium text-white/35 hover:text-white/70 transition-colors duration-200 flex items-center gap-1.5 group"
            >
              See how it works
              <span className="transition-transform duration-200 group-hover:translate-y-0.5">↓</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-12 pt-8 border-t border-studio-brd"
          >
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {['Voice Archaeology', 'Brief Translator', 'Creator Match', 'Rejection Studio', 'Living Brief', 'Pixel Pact', 'Brand Discovery'].map((name, i) => (
                <button
                  key={name}
                  onClick={() => scrollTo(NAV_ITEMS[i]?.id ?? '')}
                  className="font-sans text-[11px] text-white/20 hover:text-white/50 transition-colors duration-200"
                >
                  {String(i + 1).padStart(2, '0')} {name}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — product mosaic */}
        <div className="hidden lg:block">
          <div className="relative pt-14 pb-16 px-4">
            {/* Main card */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.5, ease }}
              className="mx-4"
            >
              <CardBriefPreview />
            </motion.div>

            {/* Match badge — top right */}
            <motion.div
              initial={{ opacity: 0, x: 16, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.65, delay: 0.82, ease }}
              className="absolute -top-2 right-0 z-10"
            >
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}>
                <CardMatchBadge />
              </motion.div>
            </motion.div>

            {/* Discovery badge — top left */}
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.98, ease }}
              className="absolute top-6 -left-4 z-10"
            >
              <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}>
                <CardDiscovery />
              </motion.div>
            </motion.div>

            {/* Living brief — bottom left */}
            <motion.div
              initial={{ opacity: 0, x: -14, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.65, delay: 1.12, ease }}
              className="absolute -bottom-2 -left-4 z-10"
            >
              <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}>
                <CardLivingBrief />
              </motion.div>
            </motion.div>

            {/* Risk card — bottom right */}
            <motion.div
              initial={{ opacity: 0, x: 14, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.65, delay: 1.28, ease }}
              className="absolute -bottom-6 right-0 z-10"
            >
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}>
                <CardRiskBadge />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-white/15 to-transparent"
        />
        <span className="label-caps text-white/15">scroll</span>
      </motion.div>
    </section>
  )
}

// ─── Shared Section Primitives ────────────────────────────────────────────────

function InView({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SectionNumber({ n, light }: { n: string; light?: boolean }) {
  return (
    <span className={`label-caps ${light ? 'text-ink-tertiary' : 'text-white/25'}`}>{n}</span>
  )
}

// ─── 01 Brand Voice Archaeology ──────────────────────────────────────────────

function ArchaeologyVisual() {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-100px' })

  const patterns = [
    { says: '"authentic"', rewards: 'Transformation arc — struggle first', highlight: true },
    { says: '"premium quality"', rewards: 'Achievement peak moments', highlight: false },
    { says: '"community-driven"', rewards: 'Peer challenge & response content', highlight: false },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease }}
      className="rounded-2xl overflow-hidden border border-studio-brd"
      style={{ background: '#0F0E0B' }}
    >
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-studio-brd flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-ember-400/10 border border-ember-400/20 flex items-center justify-center">
            <span className="text-[9px] text-ember-400">◈</span>
          </div>
          <span className="label-caps text-white/40">Brand Voice Archaeology</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans text-[11px] text-white/25">Nike · 847 posts</span>
          <span className="w-1.5 h-1.5 rounded-full bg-ember-400/60" />
        </div>
      </div>

      {/* Brand identity row */}
      <div className="px-6 py-5 border-b border-studio-brd/50 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0">
          <span className="font-serif font-bold text-studio-bg text-xl">N</span>
        </div>
        <div>
          <div className="font-serif text-xl text-white">Nike</div>
          <div className="font-sans text-[11px] text-white/35 mt-0.5">Athletic Apparel · Aspirational Performance</div>
        </div>
        <div className="ml-auto">
          <MiniRing score={94} size={40} />
        </div>
      </div>

      {/* Pattern comparison */}
      <div className="p-5 space-y-3">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mb-4">
          <span className="label-caps text-white/25">What they say</span>
          <span className="text-white/15 text-xs">→</span>
          <span className="label-caps text-ember-400/60">What they reward</span>
        </div>

        {patterns.map((p, i) => (
          <motion.div
            key={p.says}
            initial={{ opacity: 0, x: -8 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.12, ease }}
            className={`grid grid-cols-[1fr_auto_1fr] gap-3 items-start p-3 rounded-xl ${p.highlight ? 'bg-ember-800/20 border border-ember-600/15' : 'bg-studio-ele/40'}`}
          >
            <span className="font-mono text-[12px] text-white/45">{p.says}</span>
            <span className="text-white/15 text-xs mt-0.5">→</span>
            <span className="font-sans text-[12px] text-white/70 leading-relaxed">{p.rewards}</span>
          </motion.div>
        ))}
      </div>

      {/* Insight card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.75, ease }}
        className="mx-5 mb-5 rounded-xl p-4 border border-ember-600/20"
        style={{ background: 'rgba(139,75,16,0.15)' }}
      >
        <div className="label-caps text-ember-400/70 mb-2">Pattern Insight</div>
        <p className="font-sans text-[12px] text-white/60 leading-relaxed">
          Nike never rewards comfort language. Highest-performing content always leads with struggle — then shows the product enabling the breakthrough.
        </p>
      </motion.div>
    </motion.div>
  )
}

function ArchaeologySection({ onNavigate }: { onNavigate: (dest: 'archaeology' | 'translator' | 'studio') => void }) {
  return (
    <section id="archaeology" className="scroll-mt-16 bg-studio-bg section-pad px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        <div>
          <InView>
            <SectionNumber n="01 — Voice Archaeology" />
          </InView>
          <InView className="mt-5">
            <h2 className="font-serif font-light text-display-l text-white leading-tight">
              Decode the DNA of any brand.
            </h2>
          </InView>
          <InView className="mt-6">
            <p className="font-sans text-[15px] text-white/45 leading-[1.85] max-w-sm">
              Every brand says "authentic." But Nike punishes comfort language while Lululemon rewards it. Intent analyzes thousands of approved campaigns to surface what brands <em className="text-white/70 not-italic">actually</em> select.
            </p>
          </InView>
          <InView className="mt-7">
            <p className="font-sans text-[15px] text-white/45 leading-[1.85] max-w-sm">
              Not guidelines. Behavioral patterns extracted from what got approved — and what got rejected.
            </p>
          </InView>
          <InView className="mt-10 flex flex-wrap gap-3">
            {['Tone patterns', 'Visual dos & don\'ts', 'Hook structures', 'Banned vocabulary'].map(tag => (
              <span key={tag} className="font-sans text-[11px] text-white/40 px-3 py-1.5 rounded-full border border-studio-brd">
                {tag}
              </span>
            ))}
          </InView>
          <InView className="mt-10">
            <button
              onClick={() => onNavigate('archaeology')}
              className="inline-flex items-center gap-2 font-sans text-sm font-medium text-white/60 hover:text-white transition-colors duration-200 group border-b border-white/15 pb-0.5 hover:border-white/40"
            >
              Explore voice archaeology
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </InView>
        </div>

        <InView>
          <ArchaeologyVisual />
        </InView>
      </div>
    </section>
  )
}

// ─── 02 Brief Translator ──────────────────────────────────────────────────────

function TranslatorVisual() {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-100px' })

  const dos = ['Open with physical struggle or motion', 'Show product at peak achievement moment', 'Use creator\'s genuine voice — not VO']
  const avoids = ['Comfort or ease language ("so soft", "cozy")', 'Discount codes or affiliate mentions', 'Shot talking-head formats']

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease }}
    >
      {/* Brief input */}
      <div className="rounded-2xl overflow-hidden border border-studio-brd mb-3" style={{ background: '#0F0E0B' }}>
        <div className="px-5 py-3.5 border-b border-studio-brd flex items-center justify-between">
          <span className="label-caps text-white/30">Original Brief</span>
          <span className="label-caps text-ember-400/60">Nike</span>
        </div>
        <div className="p-5">
          <p className="font-mono text-[13px] text-white/45 leading-[1.8]">
            "We need <span className="text-ember-300/70 bg-ember-400/10 px-1 rounded">authentic</span>, community-driven content that showcases{' '}
            <span className="text-ember-300/70 bg-ember-400/10 px-1 rounded">real performance</span> and appeals to our{' '}
            <span className="text-ember-300/70 bg-ember-400/10 px-1 rounded">aspirational</span> audience."
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center gap-3 my-3">
        <div className="h-px flex-1 bg-studio-brd" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-studio-brd bg-studio-card">
          <div className="w-1.5 h-1.5 rounded-full bg-ember-400 animate-pulse" />
          <span className="font-sans text-[10px] text-white/30">AI translation</span>
        </div>
        <div className="h-px flex-1 bg-studio-brd" />
      </div>

      {/* Translation output */}
      <div className="rounded-2xl overflow-hidden border border-studio-brd" style={{ background: '#0F0E0B' }}>
        <div className="px-5 py-3.5 border-b border-studio-brd flex items-center justify-between">
          <span className="label-caps text-white/30">What this means for your content</span>
          <span className="label-caps text-emerald-400/60">87% match</span>
        </div>
        <div className="p-5 space-y-2 border-b border-studio-brd/50">
          <div className="label-caps text-emerald-400/60 mb-3">Do this</div>
          {dos.map((d, i) => (
            <motion.div
              key={d}
              initial={{ opacity: 0, x: -6 }}
              animate={visible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1, ease }}
              className="flex items-start gap-3"
            >
              <span className="text-emerald-400 text-[11px] mt-0.5 shrink-0">✓</span>
              <span className="font-sans text-[13px] text-white/60 leading-relaxed">{d}</span>
            </motion.div>
          ))}
        </div>
        <div className="p-5 space-y-2">
          <div className="label-caps text-red-400/60 mb-3">Never do this</div>
          {avoids.map((a, i) => (
            <motion.div
              key={a}
              initial={{ opacity: 0, x: -6 }}
              animate={visible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.65 + i * 0.1, ease }}
              className="flex items-start gap-3"
            >
              <span className="text-red-400 text-[11px] mt-0.5 shrink-0">✗</span>
              <span className="font-sans text-[13px] text-white/45 leading-relaxed">{a}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function TranslatorSection({ onNavigate }: { onNavigate: (dest: 'archaeology' | 'translator' | 'studio') => void }) {
  return (
    <section id="translator" className="scroll-mt-16 bg-surface-0 section-pad px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

        <InView>
          <TranslatorVisual />
        </InView>

        <div>
          <InView>
            <SectionNumber n="02 — Brief Translator" light />
          </InView>
          <InView className="mt-5">
            <h2 className="font-serif font-light text-display-l text-ink-primary leading-tight">
              Turn vague briefs into precise creative direction.
            </h2>
          </InView>
          <InView className="mt-6">
            <p className="font-sans text-[15px] text-ink-secondary leading-[1.85] max-w-sm">
              Brands write briefs for lawyers, not creators. "Authentic" means completely different things at Nike versus Lululemon. Intent translates brand marketing language into actionable creative instructions.
            </p>
          </InView>
          <InView className="mt-7">
            <p className="font-sans text-[15px] text-ink-secondary leading-[1.85] max-w-sm">
              Know exactly what shots to open with, which words to avoid, and how to structure the narrative — before you film a single second.
            </p>
          </InView>
          <InView className="mt-10 space-y-3">
            {[
              { stat: '4×', desc: 'fewer creative revisions on average' },
              { stat: '91%', desc: 'first-pass approval rate for Brief Translator users' },
            ].map(s => (
              <div key={s.stat} className="flex items-baseline gap-3">
                <span className="font-serif text-display-m text-ink-primary font-light">{s.stat}</span>
                <span className="font-sans text-sm text-ink-tertiary">{s.desc}</span>
              </div>
            ))}
          </InView>
          <InView className="mt-10">
            <button
              onClick={() => onNavigate('translator')}
              className="inline-flex items-center gap-2 font-sans text-sm font-medium text-ink-primary hover:text-ember-600 transition-colors duration-200 group border-b border-ink-primary/20 pb-0.5 hover:border-ember-400"
            >
              Try the translator
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </InView>
        </div>
      </div>
    </section>
  )
}

// ─── 03 Creator Match Studio ──────────────────────────────────────────────────

function MatchStudioVisual() {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-100px' })

  const brands = [
    { name: 'Gymshark', score: 91, label: 'Excellent', color: '#F5A653' },
    { name: 'Nike', score: 87, label: 'Strong', color: '#F5A653' },
    { name: 'Lululemon', score: 79, label: 'Good', color: '#EAB308' },
    { name: 'Under Armour', score: 68, label: 'Fair', color: '#6B7280' },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease }}
      className="rounded-2xl overflow-hidden border border-studio-brd"
      style={{ background: '#0F0E0B' }}
    >
      {/* Creator header */}
      <div className="px-6 py-5 border-b border-studio-brd flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ember-400 to-ember-800 flex items-center justify-center text-white font-serif text-lg shrink-0">
          S
        </div>
        <div>
          <div className="font-sans text-[15px] font-semibold text-white">@sarah_runs</div>
          <div className="font-sans text-[11px] text-white/35 mt-0.5">Athletic · Outdoor · Real training · 284K followers</div>
        </div>
        <div className="ml-auto label-caps text-ember-400/60">4 matches</div>
      </div>

      {/* Match cards */}
      <div className="p-5 grid grid-cols-2 gap-3">
        {brands.map((b, i) => (
          <motion.div
            key={b.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={visible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.25 + i * 0.1, ease }}
            className="bg-studio-ele rounded-xl p-4 border border-studio-brd/60"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-studio-card border border-studio-brd flex items-center justify-center">
                <span className="font-serif font-bold text-xs text-white/60">{b.name[0]}</span>
              </div>
              <MiniRing score={b.score} size={36} color={b.color} />
            </div>
            <div className="font-sans text-[13px] font-medium text-white/80">{b.name}</div>
            <div className={`label-caps mt-1`} style={{ color: b.color + 'aa' }}>{b.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Voice comparison */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mx-5 mb-5 rounded-xl p-4 bg-studio-card border border-studio-brd/50"
      >
        <div className="label-caps text-white/25 mb-3">Voice signature match</div>
        <div className="space-y-2">
          {[
            { trait: 'Raw authenticity', match: 95 },
            { trait: 'Achievement narrative', match: 88 },
            { trait: 'Community focus', match: 72 },
          ].map(t => (
            <div key={t.trait} className="flex items-center gap-3">
              <span className="font-sans text-[11px] text-white/40 w-36 shrink-0">{t.trait}</span>
              <div className="flex-1 h-1 bg-studio-ele rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={visible ? { width: `${t.match}%` } : { width: 0 }}
                  transition={{ duration: 0.8, delay: 0.8, ease }}
                  className="h-full rounded-full bg-ember-400/70"
                />
              </div>
              <span className="font-mono text-[11px] text-white/30 w-8 text-right">{t.match}%</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function MatchStudioSection() {
  return (
    <section id="match" className="scroll-mt-16 bg-studio-card section-pad px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        <div>
          <InView>
            <SectionNumber n="03 — Creator Match Studio" />
          </InView>
          <InView className="mt-5">
            <h2 className="font-serif font-light text-display-l text-white leading-tight">
              Find the brands your voice was made for.
            </h2>
          </InView>
          <InView className="mt-6">
            <p className="font-sans text-[15px] text-white/45 leading-[1.85] max-w-sm">
              Not follower count. Not niche. Voice match. Intent compares your actual content fingerprint against brand behavioral profiles to produce an alignment score that predicts approval rates.
            </p>
          </InView>
          <InView className="mt-7">
            <p className="font-sans text-[15px] text-white/45 leading-[1.85] max-w-sm">
              A 91% match means your natural content style already performs inside a brand's approved patterns. You're not adapting — you're amplifying.
            </p>
          </InView>
          <InView className="mt-10 space-y-4">
            {[
              'Voice fingerprint across 200+ content signals',
              'Ranked matches from 847 analyzed brands',
              'Predicted approval rate per brand',
            ].map(feat => (
              <div key={feat} className="flex items-start gap-3">
                <span className="text-ember-400 mt-0.5 shrink-0">◈</span>
                <span className="font-sans text-[14px] text-white/55">{feat}</span>
              </div>
            ))}
          </InView>
        </div>

        <InView>
          <MatchStudioVisual />
        </InView>
      </div>
    </section>
  )
}

// ─── 04 Rejection Prevention Studio ──────────────────────────────────────────

function RejectionVisual() {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-100px' })

  const lines = [
    { n: '01', text: 'Hey everyone, today I want to show you...', level: 'warn', issue: 'Weak hook — no tension or motion' },
    { n: '08', text: "These shoes are honestly so comfortable...", level: 'critical', issue: '"Comfortable" — Nike zero tolerance' },
    { n: '14', text: 'Use code SARAH20 for 20% off today.', level: 'critical', issue: 'Promo code — 100% rejection signal' },
    { n: '22', text: 'The grip held on a 14km trail ascent.', level: 'clean', issue: '' },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease }}
      className="rounded-2xl overflow-hidden border border-studio-brd"
      style={{ background: '#0F0E0B' }}
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-studio-brd flex items-center justify-between">
        <span className="label-caps text-white/30">nike_collab_v3.txt</span>
        <div className="flex items-center gap-2">
          <span className="font-sans text-[11px] text-white/25">7 issues</span>
          <span className="font-sans text-[11px] font-semibold px-2 py-0.5 rounded" style={{ background: '#7F1D1D', color: '#FCA5A5', fontSize: '10px' }}>78% risk</span>
        </div>
      </div>

      {/* Script lines */}
      <div className="p-4 space-y-1">
        {lines.map((line, i) => (
          <motion.div
            key={line.n}
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.25 + i * 0.12 }}
            className={`rounded-lg px-4 py-3 ${
              line.level === 'critical' ? 'bg-red-950/40 border-l-2 border-red-500' :
              line.level === 'warn' ? 'bg-amber-950/30 border-l-2 border-amber-500' :
              'bg-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="font-mono text-[10px] text-white/20 mt-0.5 shrink-0 w-4">{line.n}</span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[12px] text-white/55 leading-relaxed">{line.text}</p>
                {line.issue && (
                  <motion.div
                    initial={{ opacity: 0, y: 3 }}
                    animate={visible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.45 + i * 0.12 }}
                    className="mt-1.5 flex items-center gap-2"
                  >
                    <span className={`font-sans text-[10px] font-medium ${line.level === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                      {line.level === 'critical' ? '● Critical' : '● Warning'}
                    </span>
                    <span className="font-sans text-[10px] text-white/25">{line.issue}</span>
                  </motion.div>
                )}
              </div>
              {line.level === 'clean' && <span className="text-emerald-400 text-[10px] shrink-0">✓</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI fix card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mx-4 mb-4 rounded-xl overflow-hidden border border-studio-brd"
      >
        <div className="px-4 py-2 border-b border-studio-brd bg-studio-ele">
          <span className="label-caps text-white/25">AI Suggested Fix · Line 08</span>
        </div>
        <div className="p-4 space-y-1.5">
          <div className="flex items-start gap-2.5 bg-red-950/30 rounded px-3 py-2">
            <span className="text-red-400 text-[11px] shrink-0 mt-0.5">−</span>
            <span className="font-mono text-[11px] text-red-300/60 line-through">These shoes are so comfortable...</span>
          </div>
          <div className="flex items-start gap-2.5 bg-emerald-950/30 rounded px-3 py-2">
            <span className="text-emerald-400 text-[11px] shrink-0 mt-0.5">+</span>
            <span className="font-mono text-[11px] text-emerald-300/70">Still locked in after 18km of technical trail.</span>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-studio-brd flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: '#EF4444' }}>
            <span className="font-sans font-semibold text-[11px] text-red-400">78</span>
          </div>
          <div>
            <div className="font-sans text-[10px] font-semibold text-red-400">VERY HIGH RISK</div>
            <div className="font-sans text-[10px] text-white/25">3 critical · 3 high · 1 medium</div>
          </div>
        </div>
        <button className="font-sans text-[11px] font-medium px-3 py-1.5 rounded-md" style={{ background: '#D97C28', color: 'white' }}>
          Apply all fixes →
        </button>
      </div>
    </motion.div>
  )
}

function RejectionSection({ onNavigate }: { onNavigate: (dest: 'archaeology' | 'translator' | 'studio') => void }) {
  return (
    <section id="rejection" className="scroll-mt-16 bg-surface-0 section-pad px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

        <InView>
          <RejectionVisual />
        </InView>

        <div>
          <InView>
            <SectionNumber n="04 — Rejection Prevention Studio" light />
          </InView>
          <InView className="mt-5">
            <h2 className="font-serif font-light text-display-l text-ink-primary leading-tight">
              Your script, reviewed before you submit it.
            </h2>
          </InView>
          <InView className="mt-6">
            <p className="font-sans text-[15px] text-ink-secondary leading-[1.85] max-w-sm">
              Paste your script, caption, or concept. Intent flags weak hooks, banned words, tone mismatches, and known rejection patterns — line by line, before you invest more time in production.
            </p>
          </InView>
          <InView className="mt-7">
            <p className="font-sans text-[15px] text-ink-secondary leading-[1.85] max-w-sm">
              One click applies AI-suggested rewrites for every flagged line. Watch the rejection risk score drop in real time.
            </p>
          </InView>
          <InView className="mt-10 space-y-4">
            {[
              { color: 'bg-red-500', label: 'Critical', desc: 'Immediate rejection triggers' },
              { color: 'bg-amber-500', label: 'High risk', desc: 'Known brand friction patterns' },
              { color: 'bg-yellow-500', label: 'Medium', desc: 'Suboptimal but recoverable' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                <span className="font-sans text-[13px] font-medium text-ink-primary">{item.label}</span>
                <span className="font-sans text-[13px] text-ink-tertiary">— {item.desc}</span>
              </div>
            ))}
          </InView>
          <InView className="mt-10">
            <button
              onClick={() => onNavigate('studio')}
              className="inline-flex items-center gap-2 font-sans text-sm font-medium text-ink-primary hover:text-ember-600 transition-colors duration-200 group border-b border-ink-primary/20 pb-0.5 hover:border-ember-400"
            >
              Review your content
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </InView>
        </div>
      </div>
    </section>
  )
}

// ─── 05 Living Brief ──────────────────────────────────────────────────────────

function LivingBriefVisual() {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-100px' })

  const signals = [
    { type: 'new', color: '#EF4444', label: 'New Signal', text: 'Outdoor/urban content +34% CTR this week — shift from gym to street context', time: '2 min ago' },
    { type: 'update', color: '#F5A653', label: 'Tone Update', text: 'Reduce polished aesthetic → more raw, gritty, and real. Cinematic lighting now penalized.', time: '18 min ago' },
    { type: 'alert', color: '#EAB308', label: 'Tolerance Alert', text: 'Comfort language now at 0% tolerance. Any softness = immediate reject.', time: '1 hr ago' },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease }}
      className="rounded-2xl overflow-hidden border border-studio-brd"
      style={{ background: '#0F0E0B' }}
    >
      {/* Live header */}
      <div className="px-6 py-4 border-b border-studio-brd flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
          </div>
          <span className="label-caps text-emerald-400/80">Live</span>
          <span className="label-caps text-white/25">Nike Living Brief</span>
        </div>
        <span className="font-sans text-[11px] text-white/25">↺ Updated 2 min ago</span>
      </div>

      {/* Campaign context */}
      <div className="px-6 py-4 border-b border-studio-brd/50 bg-studio-ele/30">
        <div className="font-sans text-[14px] font-medium text-white/80">Air Max 2025 — Street Sport Campaign</div>
        <div className="font-sans text-[11px] text-white/30 mt-0.5">Active · 14 creators enrolled · $48K total budget</div>
      </div>

      {/* Signal feed */}
      <div className="p-5 space-y-3">
        {signals.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -10 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease }}
            className="rounded-xl p-4 border border-studio-brd/50 bg-studio-ele/20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="label-caps" style={{ color: s.color + '99' }}>{s.label}</span>
              </div>
              <span className="font-sans text-[10px] text-white/20">{s.time}</span>
            </div>
            <p className="font-sans text-[12px] text-white/50 leading-relaxed">{s.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Baseline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mx-5 mb-5 rounded-xl p-4 border border-studio-brd/50"
      >
        <div className="label-caps text-white/20 mb-3">Core requirements (unchanged)</div>
        <div className="flex flex-wrap gap-2">
          {["Creator's own voice", 'Open with motion', 'No voiceover', 'No promo codes', '60s max'].map(req => (
            <span key={req} className="font-sans text-[11px] text-white/35 px-2 py-1 bg-studio-ele rounded-md">{req}</span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function LivingBriefSection() {
  return (
    <section id="living" className="scroll-mt-16 bg-studio-bg section-pad px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        <div>
          <InView>
            <SectionNumber n="05 — Living Brief" />
          </InView>
          <InView className="mt-5">
            <h2 className="font-serif font-light text-display-l text-white leading-tight">
              Briefs that breathe with the campaign.
            </h2>
          </InView>
          <InView className="mt-6">
            <p className="font-sans text-[15px] text-white/45 leading-[1.85] max-w-sm">
              Campaign requirements don't stay still. Performance data changes what brands want mid-flight. The Living Brief updates in real time — so your second video benefits from signals your first video generated.
            </p>
          </InView>
          <InView className="mt-7">
            <p className="font-sans text-[15px] text-white/45 leading-[1.85] max-w-sm">
              You see exactly what changed, why it changed, and how to adapt your next piece of content before you've even started filming.
            </p>
          </InView>
          <InView className="mt-10 space-y-4">
            {[
              'Real-time campaign performance signals',
              'Automatic requirement updates from brand data',
              'Creator notification on every brief change',
              'History of all updates with reasoning',
            ].map(feat => (
              <div key={feat} className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5 shrink-0 text-sm">↗</span>
                <span className="font-sans text-[14px] text-white/50">{feat}</span>
              </div>
            ))}
          </InView>
        </div>

        <InView>
          <LivingBriefVisual />
        </InView>
      </div>
    </section>
  )
}

// ─── 06 Pixel Pact ────────────────────────────────────────────────────────────

function PixelPactVisual() {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-100px' })

  const deliverables = [
    { label: '60s vertical video', status: 'verified', note: '' },
    { label: "Creator's own voice (no VO)", status: 'verified', note: '' },
    { label: 'Open with motion (0:00–0:03)', status: 'verified', note: '' },
    { label: 'No discount code or affiliate link', status: 'rejected', note: 'Detected at 0:42' },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease }}
      className="rounded-2xl overflow-hidden border border-border-subtle bg-surface-1 shadow-card-xl"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div>
          <div className="font-sans text-[13px] font-semibold text-ink-primary">Pixel Pact</div>
          <div className="label-caps text-ink-tertiary mt-0.5">@sarah_runs × Nike · Air Max</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <span className="text-emerald-600 text-[10px]">AI</span>
          </div>
          <span className="font-sans text-[11px] text-ink-tertiary">Auto-verifying</span>
        </div>
      </div>

      {/* Deliverables */}
      <div className="p-5 space-y-2">
        {deliverables.map((d, i) => (
          <motion.div
            key={d.label}
            initial={{ opacity: 0, x: -6 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.12, ease }}
            className={`flex items-center justify-between px-4 py-3.5 rounded-xl border ${
              d.status === 'rejected'
                ? 'bg-red-50 border-red-200'
                : 'bg-surface-0 border-border-subtle'
            }`}
          >
            <div className="flex items-center gap-3">
              {d.status === 'verified' ? (
                <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                  <span className="text-emerald-600 text-[9px]">✓</span>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0">
                  <span className="text-red-600 text-[9px]">✗</span>
                </div>
              )}
              <div>
                <span className="font-sans text-[13px] text-ink-primary">{d.label}</span>
                {d.note && <div className="font-sans text-[10px] text-red-500 mt-0.5">{d.note}</div>}
              </div>
            </div>
            <span className={`label-caps ${d.status === 'verified' ? 'text-emerald-600' : 'text-red-500'}`}>
              {d.status === 'verified' ? 'Verified' : 'Rejected'}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Payment progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mx-5 mb-5 rounded-xl p-4 bg-surface-0 border border-border-subtle"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="label-caps text-ink-tertiary">Payment released</span>
          <span className="font-sans text-[13px] font-semibold text-ink-primary">$1,200 / $1,600</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={visible ? { width: '75%' } : { width: 0 }}
            transition={{ duration: 0.9, delay: 1, ease }}
            className="h-full rounded-full bg-emerald-500"
          />
        </div>
        <div className="font-sans text-[11px] text-ink-tertiary mt-2">
          Fix deliverable 4 to unlock the remaining $400
        </div>
      </motion.div>
    </motion.div>
  )
}

function PixelPactSection() {
  return (
    <section id="pixel" className="scroll-mt-16 bg-surface-2 section-pad px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

        <InView>
          <PixelPactVisual />
        </InView>

        <div>
          <InView>
            <SectionNumber n="06 — Pixel Pact" light />
          </InView>
          <InView className="mt-5">
            <h2 className="font-serif font-light text-display-l text-ink-primary leading-tight">
              Smart deliverables that verify themselves.
            </h2>
          </InView>
          <InView className="mt-6">
            <p className="font-sans text-[15px] text-ink-secondary leading-[1.85] max-w-sm">
              Pixel Pact replaces manual content review with AI verification. The moment you upload, it checks every deliverable against the brand brief — and only releases payment when the work passes.
            </p>
          </InView>
          <InView className="mt-7">
            <p className="font-sans text-[15px] text-ink-secondary leading-[1.85] max-w-sm">
              No more chasing approvals. No more ambiguous feedback. No more waiting weeks for payment. Both sides get automatic, instant, objective verification.
            </p>
          </InView>
          <InView className="mt-10 space-y-4">
            {[
              { icon: '⚡', text: 'Instant AI verification on upload' },
              { icon: '💰', text: 'Automated payment on verified deliverables' },
              { icon: '🔒', text: 'Smart contracts — both parties protected' },
              { icon: '📋', text: 'Objective, auditable approval record' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-base shrink-0">{f.icon}</span>
                <span className="font-sans text-[14px] text-ink-secondary">{f.text}</span>
              </div>
            ))}
          </InView>
        </div>
      </div>
    </section>
  )
}

// ─── 07 Brand Discovery ───────────────────────────────────────────────────────

function BrandDiscoveryVisual() {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-100px' })
  const [active, setActive] = useState('Athletic')

  const filters = ['Athletic', 'Wellness', 'Lifestyle', 'Luxury']

  const brands = [
    { name: 'Gymshark', category: 'Athletic', score: 91, level: 'Excellent', color: '#F5A653', bars: 10 },
    { name: 'Nike', category: 'Athletic', score: 87, level: 'Strong', color: '#F5A653', bars: 9 },
    { name: 'Lululemon', category: 'Wellness', score: 79, level: 'Good', color: '#EAB308', bars: 8 },
    { name: 'Under Armour', category: 'Athletic', score: 68, level: 'Fair', color: '#6B7280', bars: 7 },
    { name: 'Alo Yoga', category: 'Wellness', score: 84, level: 'Strong', color: '#F5A653', bars: 9 },
    { name: 'Tracksmith', category: 'Lifestyle', score: 76, level: 'Good', color: '#EAB308', bars: 8 },
  ].filter(b => b.category === active)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease }}
      className="rounded-2xl overflow-hidden border border-studio-brd"
      style={{ background: '#0F0E0B' }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-studio-brd flex items-center justify-between">
        <span className="label-caps text-white/30">Brand Discovery</span>
        <span className="font-sans text-[11px] text-ember-400/70">
          {brands.length} of 847 brands match your voice
        </span>
      </div>

      {/* Filters */}
      <div className="px-6 py-3.5 border-b border-studio-brd/50 flex gap-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`font-sans text-[11px] font-medium px-3 py-1.5 rounded-full transition-all duration-200 ${
              active === f
                ? 'bg-ember-600 text-white'
                : 'bg-studio-ele text-white/40 hover:text-white/70'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Brand list */}
      <div className="p-4 space-y-2 min-h-[240px]">
        <AnimatePresence mode="popLayout">
          {brands.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, delay: i * 0.07, ease }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl bg-studio-ele/40 hover:bg-studio-ele/80 transition-colors duration-150 cursor-default"
            >
              <div className="w-8 h-8 rounded-lg bg-studio-card border border-studio-brd flex items-center justify-center shrink-0">
                <span className="font-serif font-bold text-xs text-white/50">{b.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-sans text-[13px] font-medium text-white/80 truncate">{b.name}</div>
                <div className="mt-1.5 flex items-center gap-1">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-1.5 w-3 rounded-full"
                      style={{ background: j < b.bars ? b.color + 'bb' : '#2A2722' }}
                    />
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-[13px] text-white/70 font-medium">{b.score}%</div>
                <div className="label-caps mt-0.5" style={{ color: b.color + '80', fontSize: '9px' }}>{b.level}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-studio-brd flex items-center justify-between">
        <span className="font-sans text-[11px] text-white/25">847 brands · updated daily</span>
        <button className="font-sans text-[11px] font-medium text-ember-400 hover:text-ember-300 transition-colors">
          View all matches →
        </button>
      </div>
    </motion.div>
  )
}

function BrandDiscoverySection() {
  return (
    <section id="discovery" className="scroll-mt-16 bg-studio-card section-pad px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        <div>
          <InView>
            <SectionNumber n="07 — Brand Discovery" />
          </InView>
          <InView className="mt-5">
            <h2 className="font-serif font-light text-display-l text-white leading-tight">
              847 brands, analyzed. Find the ones that fit.
            </h2>
          </InView>
          <InView className="mt-6">
            <p className="font-sans text-[15px] text-white/45 leading-[1.85] max-w-sm">
              Stop cold-pitching brands that aren't a fit. Brand Discovery surfaces the partnerships where your content will naturally thrive — ranked by predicted performance, not follower demographics.
            </p>
          </InView>
          <InView className="mt-7">
            <p className="font-sans text-[15px] text-white/45 leading-[1.85] max-w-sm">
              Every brand profile includes their approval patterns, tone expectations, banned content, and what they've historically paid for excellent creative.
            </p>
          </InView>
          <InView className="mt-10">
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '847', label: 'brands analyzed' },
                { value: '12', label: 'avg. matches per creator' },
                { value: '94%', label: 'prediction accuracy' },
                { value: '$340', label: 'avg. CPM increase' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-serif text-display-m text-white font-light">{s.value}</div>
                  <div className="label-caps text-white/25 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </InView>
        </div>

        <InView>
          <BrandDiscoveryVisual />
        </InView>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA({ onNavigate }: { onNavigate: (dest: 'archaeology' | 'translator' | 'studio') => void }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-studio-bg section-pad px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
        >
          <span className="label-caps text-ember-400/60">Intent is in private beta</span>
          <h2 className="font-serif font-light text-display-l text-white mt-5 max-w-[640px] mx-auto leading-tight">
            Stop guessing what brands want.
          </h2>
          <p className="font-sans text-[15px] text-white/40 mt-6 max-w-md mx-auto leading-[1.85]">
            Join 2,400 creators who've cut revision cycles by 4× and increased first-pass approval rates to 91%.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button className="font-sans text-sm font-medium bg-ember-600 hover:bg-ember-800 text-white px-8 py-3.5 rounded-md transition-colors duration-200">
              Request early access →
            </button>
            <button
              onClick={() => onNavigate('archaeology')}
              className="font-sans text-sm font-medium text-white/35 hover:text-white/70 transition-colors duration-200"
            >
              Explore Voice Archaeology first
            </button>
          </div>
          <p className="font-sans text-[11px] text-white/20 mt-6">No credit card. No pitch deck. Just your content URL.</p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function SiteFooter() {
  return (
    <footer className="bg-studio-bg border-t border-studio-brd px-6 lg:px-10 py-12">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <span className="font-serif text-sm tracking-[0.2em] text-white/50 select-none">INTENT</span>
          <p className="font-sans text-[11px] text-white/20 mt-1.5">Creator Intelligence Platform</p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {['Voice Archaeology', 'Brief Translator', 'Creator Match', 'Rejection Studio', 'Living Brief', 'Pixel Pact', 'Brand Discovery'].map(name => (
            <span key={name} className="font-sans text-[11px] text-white/25 hover:text-white/50 transition-colors cursor-default">{name}</span>
          ))}
        </div>

        <p className="font-sans text-[11px] text-white/15">© 2025 Intent</p>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage({
  onNavigate,
}: {
  onNavigate: (dest: 'archaeology' | 'translator' | 'studio') => void
}) {
  return (
    <div className="bg-studio-bg">
      <SiteNav />
      <HeroSection />
      <ArchaeologySection onNavigate={onNavigate} />
      <TranslatorSection onNavigate={onNavigate} />
      <MatchStudioSection />
      <RejectionSection onNavigate={onNavigate} />
      <LivingBriefSection />
      <PixelPactSection />
      <BrandDiscoverySection />
      <FinalCTA onNavigate={onNavigate} />
      <SiteFooter />
    </div>
  )
}
