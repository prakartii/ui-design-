import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import ScrollReveal from './ui/ScrollReveal'

const doItems = [
  'Lead with personal story.',
  'Show transformation — before and after.',
  'Let the product appear at the achievement moment.',
  'Use handheld or motion camera throughout.',
]

const avoidItems = ['Price mentions', 'Discount language', '"Comfortable" as a word', 'Scripted feel', 'Static shots']

const originalBrief = `"We want authentic premium content that aligns with our brand values and drives meaningful engagement with target audiences while maintaining brand authenticity."`

export default function FeatureTranslator({ onTry }: { onTry?: () => void }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section-pad bg-surface-2 px-6 md:px-10">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-[7fr_5fr] gap-16 items-start">
          {/* Left — demo */}
          <div ref={ref}>
            {/* Input card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="bg-surface-1 rounded-2xl border border-border-subtle shadow-card p-7"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="label-caps text-ink-tertiary">Original brief</span>
                <span className="font-mono text-xs text-ink-tertiary bg-surface-0 px-2 py-1 rounded border border-border-subtle">Nike · Video</span>
              </div>
              <p className="font-mono text-sm text-ink-secondary leading-[1.8] italic">
                {originalBrief}
              </p>
            </motion.div>

            {/* Arrow */}
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={isInView ? { opacity: 1, scaleY: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'top' }}
              className="flex flex-col items-center my-4"
            >
              <div className="w-px h-8 bg-border-default" />
              <div className="w-2 h-2 border-r-2 border-b-2 border-border-default rotate-45 -mt-1.5" />
            </motion.div>

            {/* Output card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="bg-surface-1 rounded-2xl border border-border-subtle shadow-card overflow-hidden"
            >
              <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-border-subtle">
                <span className="label-caps text-ink-tertiary">What this means for your content</span>
                <span className="label-caps text-ember-600">For Nike</span>
              </div>

              {/* Do items */}
              <div className="px-7 pt-5 pb-4">
                <span className="label-caps text-ink-primary" style={{ fontSize: '10px' }}>Do this</span>
                <div className="mt-3 space-y-3">
                  {doItems.map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -8 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.45, delay: 0.45 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-start gap-3 pl-4 border-l-2 border-ember-400"
                    >
                      <p className="font-sans text-sm text-ink-primary leading-[1.7]">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Avoid */}
              <div className="px-7 pt-0 pb-6 border-t border-border-subtle mt-2">
                <div className="pt-4">
                  <span className="label-caps" style={{ fontSize: '10px', color: '#9B1C1C' }}>Avoid this</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {avoidItems.map(item => (
                      <span
                        key={item}
                        className="font-sans text-xs font-medium text-semantic-error bg-red-50 border border-red-100 px-2.5 py-1 rounded-md"
                      >
                        ✗ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — text */}
          <div className="md:pt-8">
            <ScrollReveal>
              <span className="label-caps text-ink-tertiary">02 — Brief Translator</span>
            </ScrollReveal>

            <ScrollReveal delay={0.08} className="mt-5">
              <h2 className="font-serif font-light text-display-m text-ink-primary leading-tight">
                Corporate language, decoded into creative direction.
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.14} className="mt-6">
              <p className="font-sans text-base text-ink-secondary leading-[1.8]">
                Paste any brand brief — an email, a PDF, raw notes — and Intent converts it
                into the clear, specific instructions creators actually need to make great work.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="mt-8">
              <p className="font-sans text-base text-ink-secondary leading-[1.8]">
                No interpretation required. No back-and-forth. Just exactly what to do,
                and what to avoid.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.26} className="mt-10">
              <button
                onClick={onTry}
                className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-ink-primary hover:text-ember-600 transition-colors duration-200 group border-b border-ink-primary/20 pb-0.5 hover:border-ember-400"
              >
                Try the translator
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
