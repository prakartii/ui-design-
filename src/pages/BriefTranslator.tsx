import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Data ─────────────────────────────────────────────────────────────────────

const EXAMPLES = [
  {
    id: 'nike',
    brand: 'Nike',
    category: 'Athletic Apparel',
    brief: `"We need authentic, community-driven content that showcases our products in empowering, real-world settings and drives meaningful engagement while maintaining premium brand standards."`,
    keywords: ['authentic', 'community-driven', 'empowering', 'meaningful', 'premium'],
    insight: 'Nike sells overcoming, not comfort. Every approved post shows a creator choosing the harder path — never the easier one.',
    dos: [
      { title: 'Open in motion', desc: 'Physical struggle in the first 3 seconds. Already mid-activity — never an intro or greeting.' },
      { title: 'Product at the achievement', desc: 'Show the shoe or gear at the crossing-the-finish-line moment, not the start.' },
      { title: 'Transformation arc', desc: 'Before → Effort → After. The product appears at the pivot — not the destination.' },
      { title: 'Kinetic camera', desc: 'No static shots, even in b-roll. Nike requires constant movement throughout.' },
      { title: 'Creator voice only', desc: 'Studio voiceover is rejected 100% of the time. The creator must carry the story.' },
    ],
    avoids: ['"Comfortable" or "easy"', 'Price or discount language', 'Scripted feel', 'Direct buy CTA', 'Resting as opening or closing'],
    matchScore: 87,
  },
  {
    id: 'lululemon',
    brand: 'Lululemon',
    category: 'Wellness Apparel',
    brief: `"Create mindful, community-first content that celebrates our wellness philosophy and helps our audience elevate their practice through authentic, aspirational storytelling."`,
    keywords: ['mindful', 'community-first', 'wellness', 'elevate', 'aspirational'],
    insight: 'Lululemon sells presence, not performance. The winning frame is stillness-within-movement — not achievement, but becoming.',
    dos: [
      { title: 'Soft, natural light', desc: 'Golden hour or diffused studio. Harsh flash or gym lighting rejected consistently.' },
      { title: 'Transition: stillness → movement', desc: 'Show the pre-practice moment, then the flow. Begin and end in calm.' },
      { title: 'Community as witness', desc: 'Others are present, watching — not competing. Peer presence over group performance.' },
      { title: 'Body-aware language', desc: 'Breath, sensation, presence in captions. Performance metrics signal wrong brand.' },
      { title: 'Product in practice', desc: 'Integrated naturally during movement — never unboxed, never static product shot.' },
    ],
    avoids: ['Extreme athleticism framing', 'Before/after transformation arcs', 'Hustle culture language', 'Countdown timers', 'Urban environments without nature'],
    matchScore: 79,
  },
  {
    id: 'gymshark',
    brand: 'Gymshark',
    category: 'Fitness Apparel',
    brief: `"We're looking for high-energy content that resonates with our fitness community, showcases functional performance, and drives discovery through creator-authentic storytelling."`,
    keywords: ['high-energy', 'community', 'functional', 'discovery', 'creator-authentic'],
    insight: 'Gymshark rewards creators who feel like a gym friend, not an athlete on a pedestal. Relatability beats aspiration here.',
    dos: [
      { title: 'Gym environment required', desc: 'Gymshark lives in the weights room. Outdoor content approved only as contrast.' },
      { title: 'Technical product detail', desc: "Fabric, fit, compression level — Gymshark's audience wants specifics." },
      { title: 'Friendly challenge format', desc: "Peer challenges drive the highest engagement in 2024. Invite, don't just perform." },
      { title: 'Multiple variants shown', desc: 'Multiple colorways or outfits in one post is expected, not excessive.' },
      { title: 'Humor welcomed', desc: 'Unlike Nike, Gymshark has approved humorous content. Personality is the product.' },
    ],
    avoids: ['Nature as primary setting', 'Cinematic production feel', 'Weight loss framing', 'Celebrity-style distance', 'Generic motivational captions'],
    matchScore: 91,
  },
]

const ease = [0.16, 1, 0.3, 1] as const
type Phase = 'idle' | 'scanning' | 'translating' | 'complete'

// ─── Typewriter Hook ──────────────────────────────────────────────────────────

function useTypewriter(text: string, active: boolean, speed = 22) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    if (!active) { setDisplayed(''); return }
    let i = 0
    setDisplayed('')
    const iv = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(iv)
    }, speed)
    return () => clearInterval(iv)
  }, [text, active, speed])

  return displayed
}

// ─── Annotated Brief ──────────────────────────────────────────────────────────

function AnnotatedBrief({ text, keywords, phase }: {
  text: string
  keywords: string[]
  phase: Phase
}) {
  const segments = useMemo(() => {
    const lc = text.toLowerCase()
    const hits: { start: number; end: number; word: string }[] = []
    for (const kw of keywords) {
      const idx = lc.indexOf(kw.toLowerCase())
      if (idx !== -1) hits.push({ start: idx, end: idx + kw.length, word: kw })
    }
    hits.sort((a, b) => a.start - b.start)

    const parts: { text: string; isKw: boolean; kwIndex: number }[] = []
    let cursor = 0
    hits.forEach((h, i) => {
      if (h.start > cursor) parts.push({ text: text.slice(cursor, h.start), isKw: false, kwIndex: -1 })
      parts.push({ text: text.slice(h.start, h.end), isKw: true, kwIndex: i })
      cursor = h.end
    })
    if (cursor < text.length) parts.push({ text: text.slice(cursor), isKw: false, kwIndex: -1 })
    return parts
  }, [text, keywords])

  const highlight = phase !== 'idle'

  return (
    <p
      className="font-mono text-sm italic leading-[1.95]"
      style={{ color: 'rgba(240,237,232,0.72)' }}
    >
      {segments.map((seg, i) =>
        seg.isKw ? (
          <motion.span
            key={i}
            animate={{
              color: highlight ? '#F5A653' : 'rgba(240,237,232,0.72)',
            }}
            transition={{ duration: 0.35, delay: highlight ? seg.kwIndex * 0.11 : 0 }}
            style={{
              borderBottom: highlight ? '1px dotted rgba(245,166,83,0.55)' : '1px dotted transparent',
              transition: 'border-bottom 0.3s ease',
            }}
          >
            {seg.text}
          </motion.span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </p>
  )
}

// ─── Scan Line ────────────────────────────────────────────────────────────────

function ScanLine({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute inset-x-0 z-10 pointer-events-none"
          initial={{ top: '0%' }}
          animate={{ top: '105%' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.15, ease: 'linear' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.6] }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <div
              className="h-[1.5px] w-full"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(245,166,83,0.3) 15%, #F5A653 45%, #F5A653 55%, rgba(245,166,83,0.3) 85%, transparent 100%)' }}
            />
            <div
              className="absolute inset-x-0 top-0 h-28 -translate-y-full"
              style={{ background: 'linear-gradient(to top, rgba(245,166,83,0.07), transparent)' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Flow Bridge ──────────────────────────────────────────────────────────────

function FlowBridge({ phase }: { phase: Phase }) {
  const active = phase === 'scanning' || phase === 'translating'
  const complete = phase === 'complete'

  const pathLabel = phase === 'idle'
    ? '→'
    : phase === 'scanning'
    ? '⟳'
    : phase === 'translating'
    ? '⋯'
    : '✓'

  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Label */}
      <motion.div
        className="absolute top-0 w-full flex justify-center"
        animate={{ opacity: active || complete ? 1 : 0.3 }}
      >
        <span
          className="label-caps"
          style={{ fontSize: '9px', color: active ? '#F5A653' : complete ? '#D97C28' : 'rgba(245,166,83,0.35)', letterSpacing: '0.1em' }}
        >
          {phase === 'idle' ? 'AI' : phase === 'scanning' ? 'reading' : phase === 'translating' ? 'translating' : 'decoded'}
        </span>
      </motion.div>

      {/* SVG flowing paths */}
      <svg width="72" height="180" viewBox="0 0 72 180" className="overflow-visible my-6">
        {[0, 1, 2].map(i => {
          const y1 = 70 + i * 18
          const y2 = 80 + i * 18
          return (
            <motion.path
              key={i}
              d={`M 0,${y1} C 36,${y1} 36,${y2} 72,${y2}`}
              stroke="#F5A653"
              strokeWidth={1.2 - i * 0.2}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="3 7"
              animate={{
                strokeDashoffset: active ? [0, -10] : [0, 0],
                opacity: active ? 0.5 - i * 0.1 : complete ? 0.25 : 0.1,
              }}
              transition={{
                strokeDashoffset: {
                  duration: 0.55 + i * 0.08,
                  repeat: active ? Infinity : 0,
                  ease: 'linear',
                },
                opacity: { duration: 0.4 },
              }}
            />
          )
        })}

        {/* Orb */}
        <motion.circle
          cx="36"
          cy="90"
          r="14"
          stroke="rgba(245,166,83,0.2)"
          strokeWidth="1"
          animate={{
            fill: complete ? 'rgba(245,166,83,0.14)' : active ? 'rgba(245,166,83,0.08)' : 'rgba(245,166,83,0.04)',
            opacity: active ? [0.7, 1, 0.7] : 1,
          }}
          transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
        />

        <motion.text
          x="36"
          y="95"
          textAnchor="middle"
          style={{ fontSize: '13px', fill: '#F5A653', fontFamily: 'Inter' }}
          animate={{ opacity: active || complete ? 1 : 0.3 }}
        >
          {pathLabel}
        </motion.text>
      </svg>

      {/* Bottom label */}
      <motion.div
        className="absolute bottom-0 w-full flex justify-center"
        animate={{ opacity: complete ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="label-caps" style={{ fontSize: '9px', color: '#D97C28', letterSpacing: '0.1em' }}>
          ↓ scroll
        </span>
      </motion.div>
    </div>
  )
}

// ─── Translation Panel ────────────────────────────────────────────────────────

function TranslationPanel({
  example,
  phase,
}: {
  example: typeof EXAMPLES[0]
  phase: Phase
}) {
  const [revealedDos, setRevealedDos] = useState(-1)
  const [revealedAvoids, setRevealedAvoids] = useState(-1)
  const [showMatch, setShowMatch] = useState(false)
  const [showInsight, setShowInsight] = useState(false)

  const insightText = useTypewriter(example.insight, showInsight, 20)
  const insightDone = insightText.length >= example.insight.length

  useEffect(() => {
    if (phase === 'idle' || phase === 'scanning') {
      setRevealedDos(-1)
      setRevealedAvoids(-1)
      setShowMatch(false)
      setShowInsight(false)
      return
    }
    if (phase !== 'translating') return

    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => setShowInsight(true), 200))

    example.dos.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedDos(i), 2200 + i * 210))
    })

    example.avoids.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedAvoids(i), 3500 + i * 130))
    })

    timers.push(setTimeout(() => setShowMatch(true), 4400))

    return () => timers.forEach(clearTimeout)
  }, [phase, example])

  const circumference = 2 * Math.PI * 22
  const ringOffset = circumference * (1 - example.matchScore / 100)

  const idle = phase === 'idle'

  return (
    <div className="relative h-full">
      {/* Idle overlay */}
      <AnimatePresence>
        {idle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: 'rgba(12,11,9,0.72)', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(245,166,83,0.1)', border: '1px solid rgba(245,166,83,0.25)' }}
            >
              <span style={{ color: '#F5A653', fontSize: '18px' }}>◈</span>
            </div>
            <p className="font-sans text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Translation will appear here
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanning state */}
      <AnimatePresence>
        {phase === 'scanning' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: 'rgba(12,11,9,0.65)', backdropFilter: 'blur(1px)', border: '1px solid rgba(245,166,83,0.12)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#F5A653' }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 0.9, delay: i * 0.22, repeat: Infinity }}
                />
              ))}
            </div>
            <p className="font-mono text-xs" style={{ color: 'rgba(245,166,83,0.6)' }}>
              Analyzing brief...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Translation content */}
      <div
        className="rounded-2xl overflow-hidden h-full"
        style={{ background: '#141210', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div
          className="px-7 pt-6 pb-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <motion.div
            animate={{ opacity: phase === 'translating' || phase === 'complete' ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="label-caps" style={{ fontSize: '9px', color: '#D97C28' }}>
                What this actually means
              </span>
              <span
                className="font-mono text-xs px-2 py-0.5 rounded"
                style={{ color: '#F5A653', background: 'rgba(245,166,83,0.1)', fontSize: '10px' }}
              >
                For {example.brand}
              </span>
            </div>
          </motion.div>

          {/* Insight typewriter */}
          <AnimatePresence mode="wait">
            {showInsight && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3"
              >
                <p
                  className="font-mono text-sm leading-[1.8]"
                  style={{ color: 'rgba(240,237,232,0.6)', fontStyle: 'italic' }}
                >
                  "{insightText}
                  {!insightDone && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.45, repeat: Infinity }}
                      className="inline-block ml-px"
                      style={{ width: '1px', height: '14px', background: '#F5A653', verticalAlign: 'middle', display: 'inline-block' }}
                    />
                  )}
                  {insightDone && '"'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dos */}
        <div className="px-7 pt-5 pb-4">
          <motion.span
            className="label-caps"
            style={{ fontSize: '9px', color: '#F5A653' }}
            animate={{ opacity: revealedDos >= 0 ? 1 : 0 }}
          >
            Do this
          </motion.span>
          <div className="mt-3 space-y-3">
            {example.dos.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: revealedDos >= i ? 1 : 0, x: revealedDos >= i ? 0 : -12 }}
                transition={{ duration: 0.45, ease }}
                className="flex items-start gap-3 pl-4"
                style={{ borderLeft: '2px solid #F5A653' }}
              >
                <div>
                  <p
                    className="font-sans text-sm font-medium leading-snug"
                    style={{ color: '#F0EDE8' }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="font-sans text-xs mt-0.5 leading-[1.7]"
                    style={{ color: 'rgba(240,237,232,0.45)' }}
                  >
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Avoids */}
        <div
          className="px-7 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <motion.span
            className="label-caps"
            style={{ fontSize: '9px', color: '#9B1C1C' }}
            animate={{ opacity: revealedAvoids >= 0 ? 1 : 0 }}
          >
            Never do this
          </motion.span>
          <div className="mt-3 flex flex-wrap gap-2">
            {example.avoids.map((item, i) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: revealedAvoids >= i ? 1 : 0, scale: revealedAvoids >= i ? 1 : 0.85 }}
                transition={{ duration: 0.3, ease }}
                className="font-sans text-xs font-medium px-2.5 py-1 rounded-md"
                style={{
                  color: '#FCA5A5',
                  background: 'rgba(155,28,28,0.15)',
                  border: '1px solid rgba(155,28,28,0.3)',
                }}
              >
                ✗ {item}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Match score */}
        <motion.div
          animate={{ opacity: showMatch ? 1 : 0, y: showMatch ? 0 : 8 }}
          transition={{ duration: 0.5, ease }}
          className="px-7 py-5 flex items-center gap-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(245,166,83,0.04)' }}
        >
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            <motion.circle
              cx="28" cy="28" r="22"
              fill="none"
              stroke="#F5A653"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={showMatch ? { strokeDashoffset: ringOffset } : { strokeDashoffset: circumference }}
              transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '28px 28px' }}
            />
            <text
              x="28" y="26"
              textAnchor="middle"
              style={{ fontSize: '13px', fontFamily: '"Playfair Display", serif', fontWeight: 300, fill: '#F0EDE8' }}
            >
              {example.matchScore}
            </text>
            <text
              x="28" y="36"
              textAnchor="middle"
              style={{ fontSize: '6px', fontFamily: 'Inter', fill: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              MATCH
            </text>
          </svg>
          <div>
            <p className="font-sans text-sm font-medium" style={{ color: '#F0EDE8' }}>
              {example.matchScore >= 90 ? 'Excellent' : example.matchScore >= 80 ? 'Strong' : 'Good'} match
            </p>
            <p className="font-sans text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Your profile for {example.brand} campaigns
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Brief Panel ──────────────────────────────────────────────────────────────

function BriefPanel({
  example,
  phase,
  onTranslate,
}: {
  example: typeof EXAMPLES[0]
  phase: Phase
  onTranslate: () => void
}) {
  const isScanning = phase === 'scanning'
  const decoded = phase === 'translating' || phase === 'complete'

  return (
    <div
      className="relative rounded-2xl overflow-hidden h-full flex flex-col"
      style={{
        background: '#1C1A17',
        border: `1px solid ${isScanning ? 'rgba(245,166,83,0.35)' : decoded ? 'rgba(245,166,83,0.15)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'border-color 0.5s ease',
        boxShadow: isScanning ? '0 0 30px rgba(245,166,83,0.1)' : 'none',
      }}
    >
      <ScanLine active={isScanning} />

      {/* Header */}
      <div
        className="px-7 pt-6 pb-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <span className="label-caps" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
          Original brief
        </span>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-xs px-2 py-0.5 rounded"
            style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', fontSize: '10px' }}
          >
            {example.brand} · Campaign
          </span>
          <AnimatePresence>
            {decoded && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="font-mono text-xs px-2 py-0.5 rounded"
                style={{ color: '#D97C28', background: 'rgba(245,166,83,0.1)', fontSize: '10px' }}
              >
                Decoded
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Brief text */}
      <div className="px-7 pt-6 pb-4 flex-1">
        <AnnotatedBrief
          text={example.brief}
          keywords={example.keywords}
          phase={phase}
        />

        {/* Keyword legend */}
        <AnimatePresence>
          {decoded && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-5 pt-4 flex flex-wrap gap-x-4 gap-y-1"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="label-caps" style={{ fontSize: '9px', color: 'rgba(245,166,83,0.5)', width: '100%', marginBottom: '4px' }}>
                Key phrases decoded
              </span>
              {example.keywords.map(kw => (
                <span
                  key={kw}
                  className="font-mono text-xs"
                  style={{ color: 'rgba(245,166,83,0.6)' }}
                >
                  · {kw}
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Translate button */}
      <div className="px-7 pb-7 pt-2">
        <motion.button
          onClick={onTranslate}
          disabled={phase !== 'idle'}
          whileHover={phase === 'idle' ? { scale: 1.02 } : {}}
          whileTap={phase === 'idle' ? { scale: 0.98 } : {}}
          className="w-full font-sans text-sm font-medium py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden"
          style={{
            background: phase === 'idle' ? '#D97C28' : 'rgba(245,166,83,0.08)',
            color: phase === 'idle' ? '#fff' : 'rgba(245,166,83,0.4)',
            cursor: phase !== 'idle' ? 'default' : 'pointer',
          }}
        >
          {isScanning
            ? 'Scanning brief...'
            : phase === 'translating'
            ? 'Translating...'
            : phase === 'complete'
            ? '↻ Translation complete'
            : `Translate for ${example.brand} →`}
        </motion.button>
      </div>
    </div>
  )
}

// ─── Brand Tabs ───────────────────────────────────────────────────────────────

function BrandTabs({
  selected,
  onChange,
}: {
  selected: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
      {EXAMPLES.map(ex => {
        const isActive = ex.id === selected
        return (
          <button
            key={ex.id}
            onClick={() => onChange(ex.id)}
            className="relative font-sans text-sm font-medium px-5 py-2.5 rounded-lg transition-colors duration-200"
            style={{ color: isActive ? '#F0EDE8' : 'rgba(255,255,255,0.35)' }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{ex.brand}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Translator Studio ────────────────────────────────────────────────────────

function TranslatorStudio({ onBack }: { onBack: () => void }) {
  const [selectedId, setSelectedId] = useState('nike')
  const [phase, setPhase] = useState<Phase>('idle')
  const [resetKey, setResetKey] = useState(0)

  const example = EXAMPLES.find(e => e.id === selectedId)!

  const triggerTranslation = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('scanning')
    setTimeout(() => setPhase('translating'), 1250)
    setTimeout(() => setPhase('complete'), 5800)
  }, [phase])

  const handleBrandChange = useCallback((id: string) => {
    setSelectedId(id)
    setPhase('idle')
    setResetKey(k => k + 1)
    setTimeout(() => {
      setPhase('scanning')
      setTimeout(() => setPhase('translating'), 1250)
      setTimeout(() => setPhase('complete'), 5800)
    }, 500)
  }, [])

  const handleReplay = useCallback(() => {
    setPhase('idle')
    setResetKey(k => k + 1)
    setTimeout(() => {
      setPhase('scanning')
      setTimeout(() => setPhase('translating'), 1250)
      setTimeout(() => setPhase('complete'), 5800)
    }, 400)
  }, [])

  // Auto-play on mount
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('scanning')
      setTimeout(() => setPhase('translating'), 1250)
      setTimeout(() => setPhase('complete'), 5800)
    }, 1600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#0C0B09' }}>
      {/* Nav */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14"
        style={{ background: 'rgba(12,11,9,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 font-sans text-sm transition-colors duration-200 group"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
              Explore brands
            </button>
            <span style={{ color: 'rgba(255,255,255,0.12)' }}>/</span>
            <span className="font-sans text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Brief Translator</span>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: phase === 'translating' || phase === 'scanning' ? 1 : 0.4 }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#F5A653' }}
                animate={{ opacity: phase === 'scanning' || phase === 'translating' ? [1, 0.3, 1] : 0.3 }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
              <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                {phase === 'idle' ? 'ready' : phase === 'scanning' ? 'reading' : phase === 'translating' ? 'translating' : 'complete'}
              </span>
            </motion.div>

            <button
              onClick={handleReplay}
              className="flex items-center gap-1.5 font-sans text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all duration-200"
              style={{
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#F0EDE8'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              }}
            >
              ↻ Replay
            </button>

            <button
              className="font-sans text-sm font-medium px-4 py-1.5 rounded-lg"
              style={{ background: '#D97C28', color: '#fff' }}
            >
              Try free →
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="pt-14">
        {/* Ember accent */}
        <div className="h-[1.5px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,166,83,0.5), transparent)' }} />

        <div className="max-w-[1440px] mx-auto px-8 pt-16 pb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="label-caps" style={{ color: '#F5A653', fontSize: '10px' }}>Brief Translator</span>
          </motion.div>

          <div className="mt-5 flex items-end justify-between gap-8">
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif font-light"
                style={{
                  fontSize: 'clamp(44px, 6.5vw, 86px)',
                  color: '#F0EDE8',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.04,
                }}
              >
                Corporate language,<br />
                <span style={{ color: 'rgba(240,237,232,0.38)' }}>decoded into</span><br />
                creative direction.
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="font-sans text-base leading-[1.8] max-w-xs shrink-0 pb-2"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Paste any brand brief. Intent translates the corporate language into specific,
              actionable direction your creators can actually use.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Brand tabs + translator */}
      <div
        className="max-w-[1440px] mx-auto px-8 pb-24"
      >
        {/* Tabs row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease }}
          className="flex items-center justify-between mb-8"
        >
          <BrandTabs selected={selectedId} onChange={handleBrandChange} />
          <p className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Click any brand to see a live translation
          </p>
        </motion.div>

        {/* 3-column translator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.65, ease }}
          className="grid gap-0 items-stretch"
          style={{ gridTemplateColumns: '1fr 88px 1fr', minHeight: '580px' }}
        >
          {/* Left: Brief */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`brief-${resetKey}-${selectedId}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.4, ease }}
              className="h-full"
            >
              <BriefPanel
                example={example}
                phase={phase}
                onTranslate={triggerTranslation}
              />
            </motion.div>
          </AnimatePresence>

          {/* Center: Bridge */}
          <div className="flex items-center justify-center py-8">
            <FlowBridge phase={phase} />
          </div>

          {/* Right: Translation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`translation-${resetKey}-${selectedId}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.4, ease }}
              className="h-full"
            >
              <TranslationPanel example={example} phase={phase} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="flex items-center justify-center gap-6 mt-10"
        >
          {[
            'Reads brand briefs in any format',
            'Trained on 847 approved campaigns',
            'Updates weekly from new submissions',
          ].map((note, i) => (
            <div key={note} className="flex items-center gap-2">
              {i > 0 && <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>}
              <span className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{note}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Gradient to light */}
      <div
        className="h-24 w-full"
        style={{ background: 'linear-gradient(to bottom, #0C0B09, #F7F6F3)' }}
      />

      {/* Examples strip */}
      <div className="bg-surface-0 px-8 pt-4 pb-24 max-w-[1440px] mx-auto">
        <div className="mb-12 text-center">
          <span className="label-caps text-ink-tertiary" style={{ fontSize: '10px' }}>More examples</span>
          <h2
            className="font-serif font-light mt-3 text-ink-primary"
            style={{ fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-0.015em' }}
          >
            Works for any brand brief.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              label: 'Agency brief',
              brief: '"Deliver compelling, on-brand narratives that resonate with our target demographic while maximizing ROI."',
              output: 'No metrics in captions. Human story first. ROI = watch time, not clicks.',
            },
            {
              label: 'Startup brief',
              brief: '"We need content that disrupts the category and speaks to early adopters in an authentic way."',
              output: 'Show the problem, not the solution. Contrarian POV rewarded. Skip the demo.',
            },
            {
              label: 'Luxury brand brief',
              brief: '"Create aspirational content that elevates brand perception and drives consideration at the premium tier."',
              output: 'Scarcity language only. Never show price. Setting matters more than product.',
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease }}
              className="bg-surface-1 rounded-2xl border border-border-subtle shadow-card overflow-hidden"
            >
              <div className="p-6 pb-4">
                <span className="label-caps text-ink-tertiary" style={{ fontSize: '9px' }}>{card.label}</span>
                <p className="font-mono text-xs text-ink-tertiary leading-[1.8] mt-3 italic">{card.brief}</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3" style={{ borderTop: '1px solid #E8E6E1' }}>
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="text-ember-400 text-xs">↓ translated</span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>
              <div className="px-6 pb-6 pt-3" style={{ borderLeft: '2px solid #F5A653' }}>
                <p className="font-sans text-sm text-ink-primary leading-[1.75]">{card.output}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#141210' }}>
        <div className="max-w-[1440px] mx-auto px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease }}
          >
            <span className="label-caps" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>Start translating</span>
            <h2
              className="font-serif font-light mt-4"
              style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', color: '#F0EDE8', letterSpacing: '-0.02em', lineHeight: 1.08 }}
            >
              Stop guessing what brands want.
            </h2>
            <p className="font-sans text-base mt-4 max-w-md mx-auto leading-[1.8]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Every campaign brief decoded. Every creator aligned. Every submission more likely to be approved.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                className="font-sans text-sm font-medium px-7 py-3.5 rounded-xl"
                style={{ background: '#D97C28', color: '#fff' }}
              >
                Start translating free →
              </button>
              <button
                onClick={onBack}
                className="font-sans text-sm font-medium px-7 py-3.5 rounded-xl"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}
              >
                Explore brand profiles
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BriefTranslator({ onBack }: { onBack: () => void }) {
  return <TranslatorStudio onBack={onBack} />
}
