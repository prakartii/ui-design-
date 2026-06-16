import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import ScrollReveal from './ui/ScrollReveal'

const rows = [
  { say: '"Be authentic."', hear: '"...?"' },
  { say: '"Keep it premium."', hear: '"...?"' },
  { say: '"Stay on brand."', hear: '"...?"' },
  { say: '"Drive engagement."', hear: '"...?"' },
  { say: '"Make it feel natural."', hear: '"...?"' },
]

const consequences = ['Rejected campaigns', 'Endless revisions', 'Poor performance', 'Creator frustration']

export default function Problem() {
  const tableRef = useRef(null)
  const isInView = useInView(tableRef, { once: true, margin: '-80px' })

  return (
    <section className="section-pad px-6 md:px-10 max-w-7xl mx-auto w-full">
      {/* Section label */}
      <ScrollReveal>
        <span className="label-caps text-ink-tertiary">The problem</span>
      </ScrollReveal>

      {/* Headline */}
      <ScrollReveal delay={0.08} className="mt-5">
        <h2 className="font-serif font-light text-display-l text-ink-primary max-w-2xl">
          Brands and creators speak different languages.
        </h2>
      </ScrollReveal>

      {/* Table */}
      <div ref={tableRef} className="mt-20 border border-border-subtle rounded-2xl overflow-hidden bg-surface-1 shadow-card">
        {/* Header */}
        <div className="grid grid-cols-[1fr_56px_1fr] border-b border-border-subtle">
          <div className="px-8 py-5 border-r border-border-subtle">
            <span className="label-caps text-ember-600">What brands say</span>
          </div>
          <div className="border-r border-border-subtle" />
          <div className="px-8 py-5">
            <span className="label-caps text-semantic-error">What creators hear</span>
          </div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <motion.div
            key={row.say}
            initial={{ opacity: 0, x: -12 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
            className={`grid grid-cols-[1fr_56px_1fr] ${i < rows.length - 1 ? 'border-b border-border-subtle' : ''}`}
          >
            <div className="px-8 py-5 border-r border-border-subtle">
              <span className="font-serif font-light text-lg text-ink-primary italic">{row.say}</span>
            </div>
            <div className="flex items-center justify-center border-r border-border-subtle">
              <motion.span
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.09 }}
                className="text-ember-400 font-sans text-base"
              >
                →
              </motion.span>
            </div>
            <div className="px-8 py-5">
              <motion.span
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.45 + i * 0.09 }}
                className="font-serif font-light text-lg text-ink-tertiary italic"
              >
                {row.hear}
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Consequences */}
      <ScrollReveal delay={0.1} className="mt-16">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-sans text-sm text-ink-tertiary">This causes:</span>
          {consequences.map(c => (
            <span
              key={c}
              className="font-sans text-sm font-medium text-semantic-error bg-red-50 border border-red-100 px-3 py-1 rounded-full"
            >
              {c}
            </span>
          ))}
        </div>
      </ScrollReveal>

      {/* Pull quote */}
      <ScrollReveal delay={0.15} className="mt-20 border-t border-border-subtle pt-16">
        <blockquote className="font-serif font-light text-display-m text-ink-primary max-w-3xl">
          "Intent fixes this."
        </blockquote>
        <p className="mt-5 font-sans text-base text-ink-secondary max-w-xl leading-[1.8]">
          By acting as a translation layer between brands and creators — decoding what brands
          actually reward, not just what they say they want.
        </p>
      </ScrollReveal>
    </section>
  )
}
