import ScrollReveal from './ui/ScrollReveal'

const creatorFeatures = [
  '5 brand analyses per month',
  'Unlimited brief translations',
  '1 content review per day',
  'Brand match scores',
  'AI Copilot access',
]

const brandFeatures = [
  'Unlimited brand archaeology',
  'Living Brief — auto-updates',
  'Creator Match Studio',
  'Team access (up to 10)',
  'API access',
  'Priority support',
]

export default function Pricing() {
  return (
    <section className="section-pad px-6 md:px-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-16">
        <ScrollReveal>
          <span className="label-caps text-ink-tertiary">Pricing</span>
        </ScrollReveal>
        <ScrollReveal delay={0.08} className="mt-5">
          <h2 className="font-serif font-light text-display-m text-ink-primary">
            Simple pricing. No surprises.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.14} className="mt-5">
          <p className="font-sans text-base text-ink-secondary leading-[1.8]">
            Self-serve. No sales calls. No hidden fees.
          </p>
        </ScrollReveal>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Creator */}
        <ScrollReveal delay={0.1}>
          <div className="bg-surface-1 rounded-2xl border border-border-subtle shadow-card p-8 h-full flex flex-col">
            <div>
              <span className="label-caps text-ink-tertiary">Creator</span>
              <div className="mt-4 flex items-end gap-2">
                <span className="font-serif font-light text-5xl text-ink-primary">Free</span>
              </div>
              <p className="mt-2 font-sans text-sm text-ink-tertiary">Always. No credit card required.</p>
            </div>

            <div className="mt-8 h-px bg-border-subtle" />

            <ul className="mt-6 space-y-3 flex-1">
              {creatorFeatures.map(f => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-ember-50 border border-ember-200 flex items-center justify-center">
                    <span className="text-ember-600" style={{ fontSize: '9px' }}>✓</span>
                  </span>
                  <span className="font-sans text-sm text-ink-secondary">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <a
                href="#"
                className="block w-full text-center font-sans text-sm font-medium border border-border-default text-ink-primary py-3 rounded-md hover:bg-surface-2 transition-colors duration-200"
              >
                Get started free
              </a>
            </div>
          </div>
        </ScrollReveal>

        {/* Brand */}
        <ScrollReveal delay={0.18}>
          <div className="bg-ink-primary rounded-2xl shadow-card-xl p-8 h-full flex flex-col relative overflow-hidden">
            {/* Accent line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-ember-400" />

            <div>
              <span className="label-caps text-white/40">Brand</span>
              <div className="mt-4 flex items-end gap-2">
                <span className="font-serif font-light text-5xl text-white">$299</span>
                <span className="font-sans text-sm text-white/40 mb-2">/month</span>
              </div>
              <p className="mt-2 font-sans text-sm text-white/40">Billed monthly. Cancel any time.</p>
            </div>

            <div className="mt-8 h-px bg-white/10" />

            <ul className="mt-6 space-y-3 flex-1">
              {brandFeatures.map(f => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-ember-400/20 flex items-center justify-center">
                    <span className="text-ember-400" style={{ fontSize: '9px' }}>✓</span>
                  </span>
                  <span className="font-sans text-sm text-white/70">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <a
                href="#"
                className="block w-full text-center font-sans text-sm font-medium bg-ember-600 text-white py-3 rounded-md hover:bg-ember-800 transition-colors duration-200"
              >
                Start free trial →
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Agency note */}
      <ScrollReveal delay={0.2} className="text-center mt-10">
        <p className="font-sans text-sm text-ink-tertiary">
          Managing multiple brands?{' '}
          <a href="#" className="text-ink-secondary underline underline-offset-2 hover:text-ink-primary transition-colors">
            Talk to us about Agency plans.
          </a>
        </p>
      </ScrollReveal>
    </section>
  )
}
