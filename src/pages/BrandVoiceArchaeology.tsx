import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

// ─── Data ─────────────────────────────────────────────────────────────────────

const BRAND = {
  name: 'NIKE',
  category: 'Athletic Apparel & Footwear',
  since: '1964',
  postsAnalyzed: 847,
  campaignsAnalyzed: 23,
  briefsReviewed: 156,
  lastUpdated: '3 days ago',
  matchScore: 87,
  matchBreakdown: [
    { label: 'Storytelling', score: 94 },
    { label: 'Tone', score: 89 },
    { label: 'Audience', score: 82 },
    { label: 'Production', score: 78 },
  ],
}

const RELATED = [
  { name: 'Adidas', score: 72 },
  { name: 'Lululemon', score: 85 },
  { name: 'Gymshark', score: 91 },
  { name: 'Under Armour', score: 68 },
]

const ARCHAEOLOGY = [
  {
    id: 'a1',
    says: '"Authentic"',
    rewards: ['Transformation stories', 'Achievement moments', 'Before → after arcs'],
    insight: 'Present the product at the moment of completion, not the beginning. The shoe appears when the runner crosses the finish line — never at the start.',
  },
  {
    id: 'a2',
    says: '"Community-driven"',
    rewards: ['Individual competitor moments', 'Solo breakthrough', 'Personal records broken'],
    insight: 'Nike\'s community is built around individual achievement shared publicly. The lone athlete overcomes — the crowd witnesses. Community = witness, not collaboration.',
  },
  {
    id: 'a3',
    says: '"Real stories"',
    rewards: ['High production value', 'Cinematic motion shots', 'Physical exertion visible'],
    insight: '"Real" doesn\'t mean lo-fi. It means genuine emotion at high resolution. A 4K slow-motion sweat shot is more "real" to Nike than a shaky phone video of a fun run.',
  },
  {
    id: 'a4',
    says: '"Empowering"',
    rewards: ['Competition framing', 'Beating limits', 'Specific performance metrics'],
    insight: 'Empowerment requires a target. Nike\'s approved content always names what\'s being beaten — a time, a weight, a rival, a version of yourself. Vague inspiration is rejected.',
  },
]

const TONE = [
  { label: 'Energy level', score: 9, descriptor: 'Intense', detail: 'Every approved post moves fast. Static moments are under 2s.' },
  { label: 'Aspiration', score: 9, descriptor: 'Maximal', detail: 'The ceiling is always implied. There is always a higher level.' },
  { label: 'Production quality', score: 8, descriptor: 'Polished', detail: 'Lo-fi style rejected unless contrast is the point (grit + achievement).' },
  { label: 'Personal storytelling', score: 8, descriptor: 'Essential', detail: 'Creator voice must be present. Product ads without a human story are rejected.' },
  { label: 'Humor tolerance', score: 2, descriptor: 'Very low', detail: 'Humor undermines the aspiration. Nike has approved exactly 3 humorous posts in 18 months.' },
  { label: 'Direct sales language', score: 1, descriptor: 'Forbidden', detail: '100% rejection rate for any post that mentions price, discount, or uses "buy now" framing.' },
]

const REJECTIONS = [
  { label: 'Static camera', reason: 'Nike requires kinetic motion. Even b-roll must have movement.' },
  { label: 'Scripted feel', reason: 'Must feel spontaneous — even when planned and shot 40 times.' },
  { label: 'Low energy pacing', reason: 'Slow editing or quiet moments only work in contrast to intensity.' },
  { label: 'Discount language', reason: 'Nike is a premium brand. Price mentions poison the aspiration.' },
  { label: '"Comfortable"', reason: 'Comfort is the enemy. Nike sells overcoming, not ease.' },
  { label: 'Unboxing format', reason: 'Product-first, human-second framing. Updated June 2026.' },
  { label: 'Direct buy CTA', reason: 'Link in bio only. Selling directly is considered inauthentic.' },
  { label: '"Easy" or "simple"', reason: 'Nike\'s product is for those who choose the harder path.' },
  { label: 'Over-produced voiceover', reason: 'Studio VO sounds like an ad. Nike wants creator voice.' },
  { label: 'Sitting or resting', reason: 'Opening or closing on a resting state has been rejected 100%.' },
]

const CAMPAIGNS = [
  {
    title: 'Opening Pattern',
    description: 'Physical struggle shown within the first 3 seconds. Creator is mid-activity, not introducing themselves or the product.',
    stat: '78%',
    statLabel: 'of approved campaigns',
    example: 'Creator seen from behind, beginning a hill sprint. No title card. No greeting. Already moving.',
  },
  {
    title: 'Product Integration',
    description: 'Product appears at the moment of transition or achievement — not introduced, not explained. Witnessed by the audience.',
    stat: '91%',
    statLabel: 'of approved campaigns',
    example: 'Shoe visible on pavement as creator crosses km marker. No voiceover. No product close-up.',
  },
  {
    title: 'Closing Pattern',
    description: 'End on a forward motion moment. Creator running into, not away from something. The next challenge is always implied.',
    stat: '65%',
    statLabel: 'of approved campaigns',
    example: 'Last frame: creator starting a new rep or new run. Not finishing. Always beginning again.',
  },
  {
    title: 'Caption Pattern',
    description: 'First line is an aspiration or challenge statement. Product name never appears in first line. CTA lives in comments only.',
    stat: '84%',
    statLabel: 'of approved campaigns',
    example: '"6am. Already 5km in." — No brand mention until line 3. CTA in first comment.',
  },
]

const SECTIONS = [
  { id: 'archaeology', label: 'Voice Archaeology' },
  { id: 'rejections', label: 'Rejection Patterns' },
  { id: 'campaigns', label: 'Campaign Playbook' },
  { id: 'tone', label: 'Tone Calibration' },
]

// ─── Utility ──────────────────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1] as const

function useSectionTracker(sectionIds: string[]) {
  const [active, setActive] = useState(sectionIds[0])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { rootMargin: '-30% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [sectionIds])

  return active
}

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AppBar({ onBack }: { onBack: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-14 transition-all duration-300 ${
        scrolled ? 'bg-surface-0/95 backdrop-blur-md border-b border-border-subtle' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-sans text-sm text-ink-tertiary hover:text-ink-primary transition-colors duration-200 group"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
            Explore brands
          </button>
          <span className="text-border-default font-sans text-sm">/</span>
          <span className="font-sans text-sm font-medium text-ink-primary">Nike</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="font-sans text-sm text-ink-secondary hover:text-ink-primary transition-colors border border-border-default rounded-md px-4 py-1.5">
            ♡ Save
          </button>
          <button className="font-sans text-sm font-medium bg-ember-600 text-white rounded-md px-4 py-1.5 hover:bg-ember-800 transition-colors">
            Translate a brief →
          </button>
        </div>
      </div>
    </header>
  )
}

// ─── Brand Hero ───────────────────────────────────────────────────────────────

function BrandHero() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  const circumference = 2 * Math.PI * 38
  const ringOffset = circumference * (1 - BRAND.matchScore / 100)

  return (
    <section className="relative overflow-hidden pt-14" style={{ background: '#0C0B09' }}>
      {/* Ember accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-ember-400 to-transparent opacity-60" />

      <div className="max-w-[1440px] mx-auto px-10 pt-14 pb-16">
        <div className="flex items-start justify-between gap-10">
          {/* Left — brand identity */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="label-caps" style={{ color: '#F5A653', fontSize: '10px' }}>
                Analyzed
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="label-caps" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>
                {BRAND.category}
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="label-caps" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>
                Updated {BRAND.lastUpdated}
              </span>
            </motion.div>

            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '108%' }}
                animate={mounted ? { y: '0%' } : {}}
                transition={{ duration: 1.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif font-light"
                style={{
                  fontSize: 'clamp(72px, 11vw, 148px)',
                  letterSpacing: '0.08em',
                  lineHeight: 0.95,
                  color: '#F0EDE8',
                }}
              >
                NIKE
              </motion.h1>
            </div>

            {/* Bottom stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7, ease }}
              className="mt-10 flex items-center gap-10 border-t pt-8"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              {[
                { value: BRAND.postsAnalyzed.toString(), label: 'posts analyzed' },
                { value: BRAND.campaignsAnalyzed.toString(), label: 'campaigns' },
                { value: BRAND.briefsReviewed.toString(), label: 'creator briefs' },
                { value: '18 months', label: 'data window' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0 }}
                  animate={mounted ? { opacity: 1 } : {}}
                  transition={{ delay: 0.8 + i * 0.06 }}
                >
                  <div className="font-mono text-lg" style={{ color: '#F0EDE8' }}>{stat.value}</div>
                  <div className="label-caps mt-1" style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px' }}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right — match score */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4, ease }}
            className="shrink-0 flex flex-col items-center"
          >
            <div className="relative">
              <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                <motion.circle
                  cx="50" cy="50" r="38"
                  fill="none"
                  stroke="#F5A653"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={mounted ? { strokeDashoffset: ringOffset } : {}}
                  transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
                />
                <text
                  x="50" y="46"
                  textAnchor="middle"
                  style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', fontWeight: 300, fill: '#F0EDE8' }}
                >
                  {BRAND.matchScore}
                </text>
                <text
                  x="50" y="62"
                  textAnchor="middle"
                  style={{ fontSize: '8px', fontFamily: 'Inter, sans-serif', fill: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  MATCH
                </text>
              </svg>
            </div>

            <div className="mt-4 text-center">
              <div className="label-caps" style={{ color: '#F5A653', fontSize: '10px' }}>Strong match</div>
              <p className="font-sans text-xs leading-[1.6] mt-2 max-w-[140px] text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Your storytelling style aligns with what Nike consistently rewards.
              </p>
            </div>

            {/* Sub-scores */}
            <div className="mt-6 space-y-2 w-36">
              {BRAND.matchBreakdown.map(sub => (
                <div key={sub.label} className="flex items-center justify-between">
                  <span className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{sub.label}</span>
                  <span className="font-mono text-xs" style={{ color: '#F5A653', fontSize: '11px' }}>{sub.score}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gradient fade to page bg */}
      <div
        className="h-16 w-full"
        style={{ background: 'linear-gradient(to bottom, #0C0B09, #F7F6F3)' }}
      />
    </section>
  )
}

// ─── Left Navigation ──────────────────────────────────────────────────────────

function LeftNav({ activeSection }: { activeSection: string }) {
  const [activeRelated, setActiveRelated] = useState('Nike')

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pb-12 pr-8 border-r border-border-subtle">
      {/* Section navigation */}
      <div>
        <span className="label-caps text-ink-tertiary" style={{ fontSize: '10px' }}>On this page</span>
        <nav className="mt-4 space-y-0.5">
          {SECTIONS.map(s => {
            const isActive = activeSection === s.id
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${
                  isActive
                    ? 'bg-ember-50 text-ember-800'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-2'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                    isActive ? 'bg-ember-400' : 'bg-border-default group-hover:bg-ink-tertiary'
                  }`}
                />
                <span className="font-sans text-sm font-medium">{s.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Divider */}
      <div className="my-8 h-px bg-border-subtle" />

      {/* Brand comparison */}
      <div>
        <span className="label-caps text-ink-tertiary" style={{ fontSize: '10px' }}>Compare brands</span>
        <div className="mt-4 space-y-1">
          {/* Active brand */}
          <div className="flex items-center justify-between px-3 py-2 rounded-md bg-ink-primary">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-ember-400 shrink-0" />
              <span className="font-sans text-sm font-medium text-white">Nike</span>
            </div>
            <span className="font-mono text-xs text-ember-400">87</span>
          </div>

          {/* Related brands */}
          {RELATED.map(b => (
            <button
              key={b.name}
              onClick={() => setActiveRelated(b.name)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface-2 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-border-default shrink-0 group-hover:bg-ink-tertiary transition-colors" />
                <span className="font-sans text-sm text-ink-secondary group-hover:text-ink-primary transition-colors">{b.name}</span>
              </div>
              <span className="font-mono text-xs text-ink-tertiary">{b.score}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="my-8 h-px bg-border-subtle" />

      {/* Data note */}
      <div className="px-3">
        <p className="font-sans text-xs text-ink-tertiary leading-[1.7]">
          Analysis is based on {BRAND.postsAnalyzed} posts, {BRAND.campaignsAnalyzed} campaigns,
          and {BRAND.briefsReviewed} creator briefs over 18 months.
        </p>
        <p className="font-sans text-xs text-ink-tertiary mt-2">
          Last updated {BRAND.lastUpdated}.
        </p>
      </div>
    </aside>
  )
}

// ─── Voice Archaeology Table ──────────────────────────────────────────────────

function ArchaeologyCard({ item, index }: { item: typeof ARCHAEOLOGY[0]; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => setExpanded(!expanded)}
      className="group bg-surface-1 rounded-2xl border border-border-subtle shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden"
      style={{ borderLeft: '3px solid #F5A653' }}
    >
      {/* Card top */}
      <div className="px-8 pt-7 pb-6">
        {/* What they say */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <span className="label-caps text-ink-tertiary" style={{ fontSize: '9px' }}>What Nike says</span>
            <p className="font-serif font-light italic mt-1.5" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', color: '#A09C97', lineHeight: 1.2 }}>
              {item.says}
            </p>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 mt-1 w-6 h-6 rounded-full border border-border-default flex items-center justify-center text-ink-tertiary text-sm"
          >
            +
          </motion.div>
        </div>

        {/* Divider with arrow */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="text-ember-400 text-sm">↓</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        {/* What they reward */}
        <div>
          <span className="label-caps" style={{ fontSize: '9px', color: '#D97C28' }}>What they actually reward</span>
          <div className="mt-3 space-y-2">
            {item.rewards.map((r, i) => (
              <motion.div
                key={r}
                initial={{ opacity: 0, x: -8 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.3 + i * 0.06, ease }}
                className="flex items-center gap-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-ember-400 shrink-0" />
                <span className="font-sans text-base text-ink-primary">{r}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable insight */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border-subtle"
          >
            <div className="px-8 py-5 bg-ember-50">
              <span className="label-caps" style={{ fontSize: '9px', color: '#D97C28' }}>Pattern insight</span>
              <p className="font-mono text-sm text-ink-secondary leading-[1.8] mt-2 italic">
                "{item.insight}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

function VoiceArchaeology() {
  return (
    <section id="archaeology" className="pt-16 pb-20 scroll-mt-20">
      <div className="mb-10">
        <span className="label-caps text-ink-tertiary" style={{ fontSize: '10px' }}>01 — Voice Archaeology</span>
        <h2
          className="font-serif font-light mt-3 text-ink-primary"
          style={{ fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.015em', lineHeight: 1.1 }}
        >
          The gap between what Nike says
          <br />
          and what Nike actually wants.
        </h2>
        <p className="font-sans text-base text-ink-secondary leading-[1.8] mt-4 max-w-xl">
          Intent analyzed {BRAND.postsAnalyzed} posts to uncover the patterns Nike consistently rewards —
          and what each stated brand value actually translates to in content.
          Click any card to reveal the pattern insight.
        </p>
      </div>

      <div className="space-y-5">
        {ARCHAEOLOGY.map((item, i) => (
          <ArchaeologyCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  )
}

// ─── Right Panel ──────────────────────────────────────────────────────────────

function ToneBar({ label, score, detail, delay }: { label: string; score: number; detail: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-sans text-xs text-ink-secondary">{label}</span>
        <span className="font-mono text-xs text-ink-tertiary">{score}/10</span>
      </div>
      <div className="h-1 bg-border-subtle rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${score * 10}%` } : {}}
          transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${score <= 2 ? 'bg-semantic-error' : 'bg-ember-400'}`}
        />
      </div>
      <motion.p
        initial={{ opacity: 0, height: 0 }}
        whileHover={{ opacity: 1, height: 'auto' }}
        className="font-sans text-xs text-ink-tertiary leading-[1.6] mt-1.5 overflow-hidden"
      >
        {detail}
      </motion.p>
    </div>
  )
}

function RightPanel() {
  return (
    <aside className="sticky top-20 h-fit pl-8 border-l border-border-subtle space-y-6 pb-12">
      {/* Match card */}
      <div className="bg-surface-1 rounded-2xl border border-border-subtle shadow-card p-6">
        <span className="label-caps text-ink-tertiary" style={{ fontSize: '10px' }}>Your match</span>
        <div className="mt-4 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0"
            style={{ borderColor: '#F5A653' }}
          >
            <span className="font-serif font-light text-xl text-ink-primary">{BRAND.matchScore}</span>
          </div>
          <div>
            <p className="font-sans text-sm font-medium text-ink-primary">Strong match</p>
            <p className="font-sans text-xs text-ink-tertiary mt-0.5">for Nike campaigns</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {BRAND.matchBreakdown.map(sub => (
            <div key={sub.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-xs text-ink-secondary">{sub.label}</span>
                <span className="font-mono text-xs text-ember-600">{sub.score}%</span>
              </div>
              <div className="h-0.5 bg-border-subtle rounded-full overflow-hidden">
                <div className="h-full bg-ember-400 rounded-full" style={{ width: `${sub.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tone snapshot */}
      <div className="bg-surface-1 rounded-2xl border border-border-subtle shadow-card p-6">
        <span className="label-caps text-ink-tertiary" style={{ fontSize: '10px' }}>Tone snapshot</span>
        <p className="font-sans text-xs text-ink-tertiary mt-1 mb-5">Hover each bar for details.</p>
        <div className="space-y-4">
          {TONE.map((t, i) => (
            <ToneBar key={t.label} label={t.label} score={t.score} detail={t.detail} delay={i * 0.08} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2.5">
        <button className="w-full font-sans text-sm font-medium bg-ember-600 text-white py-3 rounded-md hover:bg-ember-800 transition-colors">
          Translate a Nike brief →
        </button>
        <button className="w-full font-sans text-sm font-medium border border-border-default text-ink-primary py-3 rounded-md hover:bg-surface-2 transition-colors">
          Review content for Nike
        </button>
      </div>

      {/* Last update note */}
      <p className="font-sans text-xs text-ink-tertiary px-1">
        Profile last updated {BRAND.lastUpdated}. Intent re-analyzes brand profiles weekly.
      </p>
    </aside>
  )
}

// ─── Rejection Wall ───────────────────────────────────────────────────────────

function RejectionWall() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="rejections" className="scroll-mt-14" style={{ background: '#0C0B09' }}>
      <div className="max-w-[1440px] mx-auto px-10 py-24">
        <div className="flex items-start justify-between gap-10 mb-16">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="label-caps"
              style={{ color: '#9B1C1C', fontSize: '10px' }}
            >
              02 — Rejection Patterns
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.08, ease }}
              className="font-serif font-light mt-3"
              style={{ fontSize: 'clamp(32px, 4vw, 52px)', color: '#F0EDE8', letterSpacing: '-0.015em', lineHeight: 1.1 }}
            >
              What Nike will
              <br />
              always reject.
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-sans text-sm leading-[1.8] max-w-xs mt-auto"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Derived from {BRAND.briefsReviewed} rejected creator submissions
            and brand representative feedback over 18 months.
          </motion.p>
        </div>

        <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {REJECTIONS.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.06, ease }}
              className="group relative"
            >
              <div
                className="rounded-xl px-4 py-3 border cursor-default transition-all duration-200 group-hover:border-opacity-60"
                style={{ background: 'rgba(155,28,28,0.1)', border: '1px solid rgba(155,28,28,0.25)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs" style={{ color: '#F87171' }}>✗</span>
                  <span className="font-sans text-sm font-medium" style={{ color: '#FCA5A5' }}>{r.label}</span>
                </div>
              </div>

              {/* Hover tooltip */}
              <div
                className="absolute bottom-full left-0 mb-2 w-52 rounded-xl p-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ background: '#1C1A17', border: '1px solid #2A2722' }}
              >
                <p className="font-sans text-xs leading-[1.7]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {r.reason}
                </p>
                <div className="absolute bottom-[-6px] left-5 w-3 h-3 rotate-45" style={{ background: '#1C1A17', borderRight: '1px solid #2A2722', borderBottom: '1px solid #2A2722' }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Highest risk callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7, ease }}
          className="mt-10 rounded-2xl p-7"
          style={{ background: 'rgba(155,28,28,0.12)', border: '1px solid rgba(155,28,28,0.3)', borderLeft: '3px solid #9B1C1C' }}
        >
          <span className="label-caps" style={{ color: '#F87171', fontSize: '10px' }}>Highest risk pattern</span>
          <p className="font-sans text-sm leading-[1.8] mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Mentioning price, discount, or using "buy now" framing in the first 30 seconds.
            Nike has declined <strong style={{ color: '#FCA5A5' }}>100%</strong> of submissions that include this pattern.
            No exceptions in {BRAND.briefsReviewed} briefs reviewed.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Campaign Playbook ────────────────────────────────────────────────────────

function CampaignPlaybook() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="campaigns" className="section-pad scroll-mt-14 px-10 max-w-[1440px] mx-auto w-full">
      <div className="mb-14">
        <span className="label-caps text-ink-tertiary" style={{ fontSize: '10px' }}>03 — Campaign Playbook</span>
        <h2
          className="font-serif font-light mt-3 text-ink-primary"
          style={{ fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.015em', lineHeight: 1.1 }}
        >
          Structures that consistently work.
        </h2>
        <p className="font-sans text-base text-ink-secondary leading-[1.8] mt-4 max-w-xl">
          Patterns derived from approved campaigns over the past 18 months.
          These are structural, not stylistic — they work across creators and categories.
        </p>
      </div>

      <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CAMPAIGNS.map((c, i) => (
          <motion.article
            key={c.title}
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: i * 0.1, ease }}
            className="group bg-surface-1 rounded-2xl border border-border-subtle shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-start justify-between gap-4 mb-5">
                <span className="label-caps text-ink-tertiary" style={{ fontSize: '10px' }}>{c.title}</span>
                <div className="text-right shrink-0">
                  <div className="font-serif font-light text-3xl text-ember-600">{c.stat}</div>
                  <div className="label-caps text-ink-tertiary mt-0.5" style={{ fontSize: '9px' }}>{c.statLabel}</div>
                </div>
              </div>

              <p className="font-sans text-base text-ink-primary leading-[1.75]">{c.description}</p>

              <div className="mt-6 pt-5 border-t border-border-subtle">
                <span className="label-caps text-ink-tertiary" style={{ fontSize: '9px' }}>Example</span>
                <p className="font-mono text-xs text-ink-secondary leading-[1.8] mt-2 italic">
                  "{c.example}"
                </p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

// ─── Tone Calibration ─────────────────────────────────────────────────────────

function ToneCalibration() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="tone" className="scroll-mt-14 bg-surface-2">
      <div className="max-w-[1440px] mx-auto px-10 py-24">
        <div className="grid md:grid-cols-[1fr_600px] gap-20 items-start">
          {/* Left */}
          <div className="sticky top-24">
            <span className="label-caps text-ink-tertiary" style={{ fontSize: '10px' }}>04 — Tone Calibration</span>
            <h2
              className="font-serif font-light mt-3 text-ink-primary"
              style={{ fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.015em', lineHeight: 1.1 }}
            >
              How Nike's voice is calibrated.
            </h2>
            <p className="font-sans text-base text-ink-secondary leading-[1.8] mt-5 max-w-sm">
              Each dimension is scored 1–10 based on patterns in approved content.
              Hover each bar for what this means in practice.
            </p>

            <div className="mt-10 space-y-3">
              {[
                { label: 'Extreme outlier', desc: 'Energy (9) and Aspiration (9) are both at the top of the range — higher than any other athletic brand analyzed.' },
                { label: 'Hard limit', desc: 'Sales language tolerance is 1/10. This is a hard constraint, not a preference. It is the #1 reason for rejection.' },
              ].map(note => (
                <div key={note.label} className="flex items-start gap-3 bg-surface-1 rounded-xl p-4 border border-border-subtle">
                  <span className="w-1.5 h-1.5 rounded-full bg-ember-400 shrink-0 mt-1.5" />
                  <div>
                    <p className="font-sans text-xs font-semibold text-ink-primary">{note.label}</p>
                    <p className="font-sans text-xs text-ink-secondary leading-[1.7] mt-0.5">{note.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — detailed bars */}
          <div ref={ref} className="space-y-6">
            {TONE.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.09, ease }}
                className="bg-surface-1 rounded-2xl border border-border-subtle shadow-card p-7"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h3 className="font-sans text-base font-medium text-ink-primary">{t.label}</h3>
                    <p className="font-sans text-xs text-ink-tertiary mt-0.5">{t.detail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ delay: i * 0.09 + 0.5 }}
                      className="font-serif font-light text-3xl"
                      style={{ color: t.score <= 2 ? '#9B1C1C' : '#D97C28' }}
                    >
                      {t.score}
                    </motion.span>
                    <span className="font-sans text-xs text-ink-tertiary">/10</span>
                    <p className={`label-caps mt-1 ${t.score <= 2 ? 'text-semantic-error' : 'text-ember-600'}`} style={{ fontSize: '9px' }}>
                      {t.descriptor}
                    </p>
                  </div>
                </div>

                <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${t.score * 10}%` } : {}}
                    transition={{ duration: 1.1, delay: i * 0.09 + 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background: t.score <= 2
                        ? 'linear-gradient(to right, #9B1C1C, #EF4444)'
                        : 'linear-gradient(to right, #F5A653, #D97C28)',
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Action Panel ─────────────────────────────────────────────────────────────

function ActionPanel({ onBack }: { onBack: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="bg-ink-primary">
      <div ref={ref} className="max-w-[1440px] mx-auto px-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease }}
        >
          <p className="label-caps" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>Ready to work with Nike?</p>
          <h2
            className="font-serif font-light mt-4"
            style={{ color: '#F0EDE8', fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.015em', lineHeight: 1.1 }}
          >
            Put this analysis to work.
          </h2>
        </motion.div>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {[
            {
              title: 'Translate a Nike Brief',
              desc: 'Convert a Nike campaign brief into creator-friendly instructions using this voice profile.',
              cta: 'Open Brief Translator →',
              primary: true,
              delay: 0.1,
            },
            {
              title: 'Review Content for Nike',
              desc: 'Check a script, caption, or concept against Nike\'s voice profile before submitting.',
              cta: 'Open Review Studio →',
              primary: false,
              delay: 0.18,
            },
          ].map(card => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: card.delay, ease }}
              className="rounded-2xl p-8"
              style={{
                background: card.primary ? '#D97C28' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${card.primary ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              <h3 className="font-sans text-base font-semibold text-white">{card.title}</h3>
              <p className="font-sans text-sm leading-[1.75] mt-2" style={{ color: card.primary ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)' }}>
                {card.desc}
              </p>
              <button className="mt-6 font-sans text-sm font-medium text-white hover:opacity-80 transition-opacity flex items-center gap-1.5">
                {card.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-10 flex items-center justify-between border-t"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={onBack}
            className="font-sans text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-1.5"
          >
            ← Back to Explore
          </button>
          <span className="font-sans text-xs text-white/20">
            Nike · Updated {BRAND.lastUpdated}
          </span>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrandVoiceArchaeology({ onBack }: { onBack: () => void }) {
  const activeSection = useSectionTracker(SECTIONS.map(s => s.id))

  return (
    <div className="min-h-screen bg-surface-0">
      <AppBar onBack={onBack} />

      <BrandHero />

      {/* 3-column editorial layout */}
      <div
        className="max-w-[1440px] mx-auto"
        style={{ display: 'grid', gridTemplateColumns: '260px 1fr 300px', gap: 0 }}
      >
        {/* Left nav */}
        <div className="px-6">
          <LeftNav activeSection={activeSection} />
        </div>

        {/* Center content */}
        <div className="px-8 border-x border-border-subtle">
          <VoiceArchaeology />
        </div>

        {/* Right panel */}
        <div className="px-6 pt-8">
          <RightPanel />
        </div>
      </div>

      {/* Full-width sections */}
      <RejectionWall />

      <div className="max-w-[1440px] mx-auto w-full">
        <CampaignPlaybook />
      </div>

      <ToneCalibration />

      <ActionPanel onBack={onBack} />
    </div>
  )
}
