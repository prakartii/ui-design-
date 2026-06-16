import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import ScrollReveal from './ui/ScrollReveal'

const scriptLines = [
  {
    ts: '0:00',
    text: 'Hey guys, today I want to show you this incredible product I\'ve been using...',
    flag: 'warn',
    label: '⚠ Weak hook',
  },
  {
    ts: '0:08',
    text: 'It\'s honestly so comfortable during my morning runs.',
    flag: 'error',
    label: '✗ "Comfortable" — banned word',
  },
  {
    ts: '0:15',
    text: 'If you want one, use my code MAYA20 for 20% off.',
    flag: 'error',
    label: '✗ Promo code — Nike rejects 100%',
  },
  {
    ts: '0:22',
    text: 'The quality is seriously unreal. These changed my whole morning.',
    flag: 'clean',
    label: '✓ Clean',
  },
]

export default function FeatureStudio() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section-pad px-6 md:px-10 max-w-7xl mx-auto w-full">
      <div className="grid md:grid-cols-[5fr_7fr] gap-16 items-start">
        {/* Left — text */}
        <div>
          <ScrollReveal>
            <span className="label-caps text-ink-tertiary">04 — Rejection Prevention Studio</span>
          </ScrollReveal>

          <ScrollReveal delay={0.08} className="mt-5">
            <h2 className="font-serif font-light text-display-m text-ink-primary leading-tight">
              AI reviews your content before you submit it.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.14} className="mt-6">
            <p className="font-sans text-base text-ink-secondary leading-[1.8] max-w-sm">
              Paste your script, caption, or concept. Intent flags weak hooks, tone mismatches,
              banned words, and likely rejection risks — before you invest more time.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="mt-8">
            <p className="font-sans text-base text-ink-secondary leading-[1.8] max-w-sm">
              Includes suggested rewrites for every flagged line.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.26} className="mt-10 space-y-3">
            {[
              { icon: '⚠', label: 'Weak hooks', color: 'text-ember-600' },
              { icon: '⚠', label: 'Tone mismatch', color: 'text-ember-600' },
              { icon: '✗', label: 'Banned words', color: 'text-semantic-error' },
              { icon: '✗', label: 'Rejection risk patterns', color: 'text-semantic-error' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={`font-sans text-sm font-medium ${item.color}`}>{item.icon}</span>
                <span className="font-sans text-sm text-ink-secondary">{item.label}</span>
              </div>
            ))}
          </ScrollReveal>

          <ScrollReveal delay={0.32} className="mt-10">
            <a href="#" className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-ink-primary hover:text-ember-600 transition-colors duration-200 group border-b border-ink-primary/20 pb-0.5 hover:border-ember-400">
              Review your content
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
          </ScrollReveal>
        </div>

        {/* Right — dark studio preview */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl overflow-hidden shadow-card-xl"
          style={{ background: '#141210' }}
        >
          {/* Studio header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: '#2A2722' }}
          >
            <span className="font-sans text-xs font-medium text-white/60 tracking-wider uppercase">
              Rejection Prevention Studio
            </span>
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs" style={{ color: '#8C8880' }}>Nike · Script</span>
              <span
                className="font-sans text-xs font-medium text-white px-2 py-0.5 rounded"
                style={{ background: '#9B1C1C', fontSize: '11px' }}
              >
                71 risk
              </span>
            </div>
          </div>

          {/* Script lines */}
          <div className="p-6 space-y-1">
            {scriptLines.map((line, i) => (
              <motion.div
                key={line.ts}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
              >
                <div
                  className={`group relative px-4 py-3 rounded-lg cursor-default transition-colors ${
                    line.flag === 'error'
                      ? 'bg-red-950/40'
                      : line.flag === 'warn'
                      ? 'bg-amber-950/40'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs shrink-0 mt-0.5" style={{ color: '#4A4640', fontSize: '11px' }}>
                      {line.ts}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-mono text-sm leading-[1.7]"
                        style={{
                          color: line.flag === 'clean' ? '#9C9894' : '#D4D1CB',
                          fontSize: '13px',
                        }}
                      >
                        {line.text}
                      </p>
                      {line.flag !== 'clean' && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={isInView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.3, delay: 0.55 + i * 0.12 }}
                          className="mt-1.5 flex items-center gap-1.5"
                        >
                          <span
                            className="font-sans text-xs font-medium"
                            style={{
                              color: line.flag === 'error' ? '#F87171' : '#FBB54E',
                              fontSize: '11px',
                            }}
                          >
                            {line.label}
                          </span>
                          <span className="font-sans text-xs" style={{ color: '#4A4640', fontSize: '11px' }}>
                            · See fix →
                          </span>
                        </motion.div>
                      )}
                    </div>
                    {line.flag === 'clean' && (
                      <span className="shrink-0 text-xs" style={{ color: '#2D6A4F', fontSize: '11px' }}>✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom action */}
          <div
            className="px-6 py-5 border-t flex items-center justify-between"
            style={{ borderColor: '#2A2722' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#9B1C1C' }}>
                <span className="font-sans font-semibold text-xs" style={{ color: '#F87171' }}>71</span>
              </div>
              <div>
                <p className="font-sans text-xs font-medium" style={{ color: '#F87171', fontSize: '11px' }}>HIGH RISK</p>
                <p className="font-sans text-xs" style={{ color: '#4A4640', fontSize: '10px' }}>3 issues found</p>
              </div>
            </div>
            <button
              className="font-sans text-xs font-medium px-4 py-2 rounded-md transition-colors"
              style={{ background: '#D97C28', color: 'white', fontSize: '12px' }}
            >
              Fix &amp; re-run →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
