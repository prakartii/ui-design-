import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import ScrollReveal from './ui/ScrollReveal'

const outcomes = [
  {
    metric: '4 rounds',
    metricAfter: '1 round',
    label: 'Revisions',
    quote: 'Went from four revision rounds to one. Every single campaign.',
    attribution: 'Creator · 340K · Fashion & Beauty',
    delay: 0,
  },
  {
    metric: '6 weeks',
    metricAfter: '9 days',
    label: 'Approval time',
    quote: 'First submission was approved. I genuinely couldn\'t believe it.',
    attribution: 'Creator · 89K · Food & Lifestyle',
    delay: 0.1,
  },
  {
    metric: '1 in 5',
    metricAfter: '3 in 5',
    label: 'Deal rate',
    quote: 'The match score was actually right. That\'s rare for any tool.',
    attribution: 'Creator · 1.2M · Fitness',
    delay: 0.2,
  },
]

function OutcomeCard({ outcome }: { outcome: typeof outcomes[0] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: outcome.delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-surface-1 rounded-2xl border border-border-subtle shadow-card p-8 flex flex-col"
    >
      {/* Label */}
      <span className="label-caps text-ink-tertiary">{outcome.label}</span>

      {/* Before metric */}
      <div className="mt-4 relative">
        <div className="font-serif font-light text-3xl text-ink-tertiary relative inline-block">
          {outcome.metric}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.4, delay: outcome.delay + 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'left' }}
            className="absolute left-0 right-0 top-1/2 -translate-y-px h-px bg-ink-tertiary"
          />
        </div>
      </div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: outcome.delay + 0.6 }}
        className="my-2 font-sans text-lg text-ink-tertiary"
      >
        ↓
      </motion.div>

      {/* After metric */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, delay: outcome.delay + 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="font-serif font-light text-4xl text-ink-primary"
      >
        {outcome.metricAfter}
      </motion.div>

      {/* Divider */}
      <div className="mt-6 mb-5 h-px bg-border-subtle" />

      {/* Quote */}
      <blockquote className="font-serif italic font-light text-base text-ink-primary leading-[1.7] flex-1">
        "{outcome.quote}"
      </blockquote>

      {/* Attribution */}
      <p className="mt-5 font-sans text-xs text-ink-tertiary">{outcome.attribution}</p>
    </motion.div>
  )
}

export default function Outcomes() {
  return (
    <section className="section-pad bg-surface-2 px-6 md:px-10">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <ScrollReveal>
            <span className="label-caps text-ink-tertiary">Outcomes</span>
          </ScrollReveal>
          <ScrollReveal delay={0.08} className="mt-5">
            <h2 className="font-serif font-light text-display-l text-ink-primary leading-tight">
              What happens when creators stop guessing.
            </h2>
          </ScrollReveal>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {outcomes.map(o => (
            <OutcomeCard key={o.label} outcome={o} />
          ))}
        </div>
      </div>
    </section>
  )
}
