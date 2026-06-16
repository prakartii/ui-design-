import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import ScrollReveal from './ui/ScrollReveal'

const creators = [
  {
    name: 'Maya R.',
    handle: '@mayarun',
    followers: '340K',
    category: 'Fitness',
    score: 94,
    why: 'Story arc aligns with Nike\'s transformation model',
    gradient: 'from-amber-200 via-orange-200 to-rose-200',
    delay: 0,
  },
  {
    name: 'Sofia L.',
    handle: '@sofiamoves',
    followers: '892K',
    category: 'Lifestyle',
    score: 91,
    why: 'Aspirational tone matches product launch brief',
    gradient: 'from-rose-200 via-pink-200 to-purple-200',
    delay: 0.1,
  },
  {
    name: 'James T.',
    handle: '@james_fit',
    followers: '128K',
    category: 'Fitness',
    score: 87,
    why: 'Technical precision fits endurance campaign',
    gradient: 'from-sky-200 via-cyan-200 to-teal-200',
    delay: 0.2,
  },
  {
    name: 'Alex K.',
    handle: '@alexruns',
    followers: '67K',
    category: 'Running',
    score: 79,
    why: 'Niche audience overlap with target demographic',
    gradient: 'from-emerald-200 via-teal-200 to-cyan-200',
    delay: 0.3,
  },
]

function MatchRing({ score, isInView, delay }: { score: number; isInView: boolean; delay: number }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const endOffset = circ * (1 - score / 100)

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="absolute bottom-4 right-4">
      <circle cx="28" cy="28" r={r} fill="rgba(255,255,255,0.9)" />
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
      <motion.circle
        cx="28" cy="28" r={r}
        fill="none" stroke="#F5A653" strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={isInView ? { strokeDashoffset: endOffset } : {}}
        transition={{ duration: 1, delay: delay + 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '28px 28px' }}
      />
      <text
        x="28" y="32"
        textAnchor="middle"
        style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'Inter', fill: '#141210' }}
      >
        {score}
      </text>
    </svg>
  )
}

function CreatorCard({ creator, isInView }: { creator: typeof creators[0]; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: creator.delay, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-surface-1 rounded-2xl border border-border-subtle shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Portrait area */}
      <div className={`relative h-52 bg-gradient-to-br ${creator.gradient}`}>
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        {/* Initials */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-5xl font-light text-white/60 select-none">
            {creator.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        {/* Match ring */}
        <MatchRing score={creator.score} isInView={isInView} delay={creator.delay} />
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-sans text-base font-semibold text-ink-primary">{creator.name}</h3>
            <p className="font-sans text-xs text-ink-tertiary mt-0.5">{creator.handle}</p>
          </div>
          <div className="text-right">
            <span className="font-sans text-sm font-medium text-ink-primary">{creator.followers}</span>
            <p className="font-sans text-xs text-ink-tertiary">{creator.category}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border-subtle">
          <p className="label-caps text-ink-tertiary mb-1.5" style={{ fontSize: '9px' }}>Why this match</p>
          <p className="font-sans text-xs text-ink-secondary leading-[1.6]">{creator.why}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function FeatureMatch() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section-pad px-6 md:px-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <ScrollReveal>
            <span className="label-caps text-ink-tertiary">03 — Creator Match Studio</span>
          </ScrollReveal>
          <ScrollReveal delay={0.08} className="mt-5">
            <h2 className="font-serif font-light text-display-m text-ink-primary max-w-xl leading-tight">
              Matches brands with creators who actually get it.
            </h2>
          </ScrollReveal>
        </div>
        <ScrollReveal delay={0.14}>
          <p className="font-sans text-base text-ink-secondary leading-[1.8] max-w-sm">
            Based on style, storytelling, tone, and audience alignment — not just follower count.
          </p>
        </ScrollReveal>
      </div>

      {/* Cards */}
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {creators.map(c => (
          <CreatorCard key={c.name} creator={c} isInView={isInView} />
        ))}
      </div>

      {/* Footer note */}
      <ScrollReveal delay={0.1} className="mt-10 flex items-center justify-between">
        <a href="#" className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-ink-primary hover:text-ember-600 transition-colors duration-200 group border-b border-ink-primary/20 pb-0.5 hover:border-ember-400">
          See how matching works
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </a>
        <span className="font-sans text-sm text-ink-tertiary hidden md:block">
          Match scores update as brand voice profiles evolve.
        </span>
      </ScrollReveal>
    </section>
  )
}
