import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import ScrollReveal from './ui/ScrollReveal'

const rewards = ['Transformation stories', 'Achievement moments', 'Competition framing', 'Motion & energy', 'Physical exertion']
const says = ['"Authentic"', '"Community-driven"', '"Real stories"', '"Empowering"']
const rejects = ['Static camera', 'Scripted dialogue', 'Low energy', 'Discount language', '"Comfortable"']

const toneDimensions = [
  { label: 'Energy level', score: 9 },
  { label: 'Aspiration', score: 9 },
  { label: 'Production quality', score: 8 },
  { label: 'Humor tolerance', score: 2 },
  { label: 'Personal storytelling', score: 8 },
  { label: 'Sales language', score: 1 },
]

function ToneBar({ label, score, delay }: { label: string; score: number; delay: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const pct = (score / 10) * 100

  return (
    <div ref={ref} className="flex items-center gap-4">
      <span className="font-sans text-sm text-ink-secondary w-40 shrink-0">{label}</span>
      <div className="flex-1 h-[3px] bg-border-subtle rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : {}}
          transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${score <= 3 ? 'bg-semantic-error' : 'bg-ember-400'}`}
        />
      </div>
      <span className="font-mono text-xs text-ink-tertiary w-6 text-right">{score}</span>
    </div>
  )
}

export default function FeatureArchaeology({ onExplore }: { onExplore?: () => void }) {
  const cardRef = useRef(null)
  const isCardInView = useInView(cardRef, { once: true, margin: '-80px' })

  return (
    <section className="section-pad px-6 md:px-10 max-w-7xl mx-auto w-full">
      <div className="grid md:grid-cols-[5fr_7fr] gap-16 items-start">
        {/* Left — text */}
        <div>
          <ScrollReveal>
            <span className="label-caps text-ink-tertiary">01 — Brand Voice Archaeology</span>
          </ScrollReveal>

          <ScrollReveal delay={0.08} className="mt-5">
            <h2 className="font-serif font-light text-display-m text-ink-primary leading-tight">
              AI that reads the gap between what brands say and what they actually want.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.14} className="mt-6">
            <p className="font-sans text-base text-ink-secondary leading-[1.8] max-w-sm">
              Intent analyzes thousands of campaigns, websites, and social posts to uncover
              the patterns brands consistently reward — and consistently reject.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.18} className="mt-10">
            <button onClick={onExplore} className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-ink-primary hover:text-ember-600 transition-colors duration-200 group border-b border-ink-primary/20 pb-0.5 hover:border-ember-400 bg-transparent p-0">
              Explore brand profiles
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </ScrollReveal>

          {/* Tone dimensions card */}
          <ScrollReveal delay={0.22} className="mt-12">
            <div className="bg-surface-1 rounded-2xl p-6 border border-border-subtle shadow-card">
              <span className="label-caps text-ink-tertiary">Nike · Tone Dimensions</span>
              <div className="mt-5 space-y-4">
                {toneDimensions.map((dim, i) => (
                  <ToneBar key={dim.label} label={dim.label} score={dim.score} delay={0.3 + i * 0.06} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right — brand card */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 32 }}
          animate={isCardInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface-1 rounded-2xl border border-border-subtle shadow-card-xl overflow-hidden"
        >
          {/* Brand header */}
          <div className="px-8 pt-8 pb-6 border-b border-border-subtle">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif font-light text-4xl text-ink-primary tracking-tight">Nike</h3>
                <p className="mt-1 font-sans text-sm text-ink-tertiary">Athletic Apparel · Analyzed from 847 posts</p>
              </div>
              {/* Match ring */}
              <div className="flex flex-col items-center gap-1">
                <svg width="52" height="52" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="21" fill="none" stroke="#E8E6E1" strokeWidth="3" />
                  <motion.circle
                    cx="26" cy="26" r="21"
                    fill="none" stroke="#F5A653" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 21}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 21 }}
                    animate={isCardInView ? { strokeDashoffset: 2 * Math.PI * 21 * (1 - 0.87) } : {}}
                    transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '26px 26px' }}
                  />
                  <text x="26" y="30" textAnchor="middle" className="fill-ink-primary" style={{ fontSize: '11px', fontFamily: 'Inter', fontWeight: 600 }}>87</text>
                </svg>
                <span className="label-caps text-ink-tertiary" style={{ fontSize: '9px' }}>match</span>
              </div>
            </div>
          </div>

          {/* Say vs Reward */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-b border-border-subtle">
            <div className="px-6 py-5">
              <span className="label-caps text-ink-tertiary" style={{ fontSize: '10px' }}>What they say</span>
              <div className="mt-3 space-y-2">
                {says.map(s => (
                  <p key={s} className="font-serif italic font-light text-sm text-ink-secondary leading-snug">{s}</p>
                ))}
              </div>
            </div>
            <div className="px-6 py-5">
              <span className="label-caps" style={{ fontSize: '10px', color: '#D97C28' }}>What they reward</span>
              <div className="mt-3 space-y-2">
                {rewards.map((r, i) => (
                  <motion.div
                    key={r}
                    initial={{ opacity: 0, x: 8 }}
                    animate={isCardInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.45, delay: 0.5 + i * 0.07 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-ember-400 shrink-0" />
                    <span className="font-sans text-sm text-ink-primary">{r}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Rejections */}
          <div className="px-6 py-5">
            <span className="label-caps" style={{ fontSize: '10px', color: '#9B1C1C' }}>What they reject</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {rejects.map(r => (
                <span
                  key={r}
                  className="font-sans text-xs font-medium text-semantic-error border border-red-200 bg-red-50 px-2.5 py-1 rounded-md"
                >
                  ✗ {r}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
