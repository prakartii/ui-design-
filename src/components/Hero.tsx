import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const lines = ['Understand', 'what brands', 'mean.']

export default function Hero() {
  const [showScroll, setShowScroll] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowScroll(false), 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 max-w-7xl mx-auto w-full">
      {/* Subtle label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <span className="label-caps text-ink-tertiary">
          AI for creators &amp; brands
        </span>
      </motion.div>

      {/* Headline */}
      <div className="max-w-5xl">
        {lines.map((line, i) => (
          <div key={line} className="overflow-hidden">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{
                duration: 0.75,
                delay: 0.25 + i * 0.11,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-serif font-light text-display-xl text-ink-primary leading-none"
            >
              {line}
            </motion.h1>
          </div>
        ))}
      </div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 font-sans text-lg text-ink-secondary max-w-[440px] leading-[1.7]"
      >
        Intent translates brand language into creator instructions.
        No more guessing. No more rejected campaigns.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex flex-wrap items-center gap-6"
      >
        <a
          href="#"
          className="inline-flex items-center font-sans text-sm font-medium bg-ember-600 text-white px-6 py-3 rounded-md hover:bg-ember-800 transition-colors duration-200 shadow-sm"
        >
          Get early access
        </a>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors duration-200 group"
        >
          Watch a demo
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">↗</span>
        </a>
      </motion.div>

      {/* Divider rule — editorial */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: 'left' }}
        className="absolute bottom-24 left-6 md:left-10 right-6 md:right-10 h-px bg-border-subtle"
      />

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showScroll ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-10 left-6 md:left-10"
      >
        <span className="label-caps text-ink-tertiary">scroll</span>
      </motion.div>

      {/* Hero stat — right side accent */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-10 right-6 md:right-10 hidden md:flex items-end gap-8"
      >
        {[
          { value: '4×', label: 'fewer revisions' },
          { value: '91%', label: 'first-pass approval' },
          { value: '340+', label: 'brands analyzed' },
        ].map(stat => (
          <div key={stat.label} className="text-right">
            <div className="font-serif font-light text-2xl text-ink-primary">{stat.value}</div>
            <div className="label-caps text-ink-tertiary mt-0.5">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
