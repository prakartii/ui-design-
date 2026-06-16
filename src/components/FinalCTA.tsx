import ScrollReveal from './ui/ScrollReveal'

export default function FinalCTA({ onExplore }: { onExplore?: () => void }) {
  return (
    <section className="section-pad bg-surface-2 px-6 md:px-10">
      <div className="max-w-7xl mx-auto w-full">
        <div className="max-w-4xl">
          <ScrollReveal>
            <span className="label-caps text-ink-tertiary">Get started</span>
          </ScrollReveal>

          <ScrollReveal delay={0.08} className="mt-6">
            <h2 className="font-serif font-light text-display-l text-ink-primary leading-tight">
              Stop guessing.
              <br />
              <span className="text-ink-tertiary">Start knowing what</span>
              <br />
              brands actually want.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.16} className="mt-8">
            <p className="font-sans text-lg text-ink-secondary leading-[1.8] max-w-lg">
              Intent is free for creators. Set up in under two minutes.
              No credit card. No sales call. No guessing.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.22} className="mt-10 flex flex-wrap items-center gap-5">
            <button
              onClick={onExplore}
              className="inline-flex items-center font-sans text-sm font-medium bg-ember-600 text-white px-8 py-4 rounded-md hover:bg-ember-800 transition-colors duration-200 shadow-sm"
            >
              Get early access — it's free
            </button>
            <button
              onClick={onExplore}
              className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors duration-200 group"
            >
              See how it works
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">↗</span>
            </button>
          </ScrollReveal>

          {/* Bottom detail */}
          <ScrollReveal delay={0.28} className="mt-20 pt-12 border-t border-border-default flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap gap-8">
              {[
                ['340+', 'brands analyzed'],
                ['12K+', 'briefs translated'],
                ['91%', 'first-pass approval rate'],
              ].map(([val, label]) => (
                <div key={label}>
                  <div className="font-serif font-light text-3xl text-ink-primary">{val}</div>
                  <div className="label-caps text-ink-tertiary mt-1">{label}</div>
                </div>
              ))}
            </div>
            <p className="font-sans text-sm text-ink-tertiary max-w-xs leading-[1.7]">
              Trusted by creators and brand managers who are done with the guessing game.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
