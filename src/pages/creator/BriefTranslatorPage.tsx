import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1] as const

const EXAMPLES = [
  {
    id: 'nike',
    brand: 'Nike',
    brief: `"We need authentic, community-driven content that showcases our products in empowering, real-world settings and drives meaningful engagement while maintaining premium brand standards."`,
    keywords: ['authentic', 'community-driven', 'empowering', 'meaningful', 'premium'],
    dos: [
      { title: 'Open in motion', desc: 'Physical struggle in the first 3 seconds — never an intro.' },
      { title: 'Product at achievement', desc: 'Show gear at the finish-line moment, not the start.' },
      { title: 'Transformation arc', desc: 'Before → Effort → After. Product appears at the pivot.' },
      { title: 'Creator voice only', desc: 'Studio voiceover rejected 100% of the time.' },
    ],
    avoids: ['"Comfortable" or "easy"', 'Price or discount language', 'Direct buy CTA', 'Resting as opening'],
    matchScore: 87,
  },
  {
    id: 'lululemon',
    brand: 'Lululemon',
    brief: `"Create mindful, community-first content that celebrates our wellness philosophy and helps our audience elevate their practice through authentic, aspirational storytelling."`,
    keywords: ['mindful', 'community-first', 'wellness', 'elevate', 'aspirational'],
    dos: [
      { title: 'Soft, natural light', desc: 'Golden hour or diffused studio. Harsh flash rejected.' },
      { title: 'Stillness → movement', desc: 'Begin in calm, flow into activity, return to presence.' },
      { title: 'Body-aware language', desc: 'Breath, sensation, presence. Performance metrics = wrong brand.' },
    ],
    avoids: ['Extreme athleticism', 'Before/after transformation', 'Hustle culture language', 'Urban-only environments'],
    matchScore: 79,
  },
  {
    id: 'gymshark',
    brand: 'Gymshark',
    brief: `"We're looking for high-energy content that resonates with our fitness community, showcases functional performance, and drives discovery through creator-authentic storytelling."`,
    keywords: ['high-energy', 'community', 'functional', 'discovery', 'creator-authentic'],
    dos: [
      { title: 'Gym environment', desc: 'Gymshark lives in the weights room — outdoor only as contrast.' },
      { title: 'Technical product detail', desc: "Fabric, fit, compression — Gymshark's audience wants specifics." },
      { title: 'Relatable effort', desc: 'Show the grind, not just the result. Gym friend, not pedestal athlete.' },
    ],
    avoids: ['Overly polished production', 'Perfect-form-only content', 'No product detail shots'],
    matchScore: 91,
  },
]

export default function BriefTranslatorPage() {
  const [selected, setSelected] = useState(EXAMPLES[0].id)
  const [customBrief, setCustomBrief] = useState('')
  const [mode, setMode] = useState<'examples' | 'custom'>('examples')

  const example = EXAMPLES.find(e => e.id === selected)!

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">02 — Brief Translator</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          Turn vague briefs into precise direction.
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2 max-w-md">
          &ldquo;Authentic&rdquo; means completely different things at Nike vs. Lululemon. Intent translates brand marketing language into actionable creative instructions.
        </p>
      </motion.div>

      {/* Mode toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex gap-2 mb-6"
      >
        {(['examples', 'custom'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`font-sans text-[12px] font-medium px-4 py-2 rounded-lg border transition-all duration-150 capitalize ${
              mode === m
                ? 'bg-ember-600 border-ember-600 text-white'
                : 'border-studio-brd text-white/40 hover:text-white/70'
            }`}
            style={mode !== m ? { background: '#141210' } : {}}
          >
            {m === 'examples' ? 'Sample Briefs' : 'Paste Your Brief'}
          </button>
        ))}
      </motion.div>

      {mode === 'examples' ? (
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          {/* Brand selector */}
          <div className="space-y-2">
            {EXAMPLES.map(ex => (
              <button
                key={ex.id}
                onClick={() => setSelected(ex.id)}
                className={`w-full text-left rounded-xl p-4 border transition-all duration-150 ${
                  selected === ex.id
                    ? 'border-ember-600/40'
                    : 'border-studio-brd hover:border-studio-ele'
                }`}
                style={{ background: selected === ex.id ? 'rgba(217,124,40,0.06)' : '#141210' }}
              >
                <div className="font-sans text-[13px] font-semibold text-white/80">{ex.brand}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-sans text-[10px] text-white/25">{ex.matchScore}% match</span>
                  <div
                    className="h-1 w-16 rounded-full"
                    style={{ background: '#2A2722' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${ex.matchScore}%`,
                        background: '#F5A653',
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Translation panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease }}
              className="space-y-3"
            >
              {/* Original brief */}
              <div
                className="rounded-2xl overflow-hidden border border-studio-brd"
                style={{ background: '#0F0E0B' }}
              >
                <div className="px-5 py-3.5 border-b border-studio-brd flex items-center justify-between">
                  <span className="label-caps text-white/30">Original Brief</span>
                  <span className="label-caps text-ember-400/60">{example.brand}</span>
                </div>
                <div className="p-5">
                  <p className="font-mono text-[13px] text-white/45 leading-[1.8]">
                    {example.brief.split(' ').map((word, i) => {
                      const keyword = example.keywords.find(k =>
                        word.toLowerCase().includes(k.toLowerCase()),
                      )
                      return keyword ? (
                        <span key={i}>
                          <span className="text-ember-300/70 bg-ember-400/10 px-1 rounded">
                            {word}
                          </span>{' '}
                        </span>
                      ) : (
                        word + ' '
                      )
                    })}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-studio-brd" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-studio-brd bg-studio-card">
                  <div className="w-1.5 h-1.5 rounded-full bg-ember-400 animate-pulse" />
                  <span className="font-sans text-[10px] text-white/30">AI translation</span>
                </div>
                <div className="h-px flex-1 bg-studio-brd" />
              </div>

              {/* Translated output */}
              <div
                className="rounded-2xl overflow-hidden border border-studio-brd"
                style={{ background: '#0F0E0B' }}
              >
                <div className="px-5 py-3.5 border-b border-studio-brd flex items-center justify-between">
                  <span className="label-caps text-white/30">What this means for your content</span>
                  <span className="label-caps text-emerald-400/60">{example.matchScore}% match</span>
                </div>

                <div className="p-5 space-y-3 border-b border-studio-brd/50">
                  <div className="label-caps text-emerald-400/60 mb-3">Do this</div>
                  {example.dos.map(d => (
                    <div key={d.title} className="flex items-start gap-3">
                      <span className="text-emerald-400 text-[11px] mt-0.5 shrink-0">✓</span>
                      <div>
                        <span className="font-sans text-[13px] font-medium text-white/70">
                          {d.title}
                        </span>
                        <span className="font-sans text-[12px] text-white/40"> — {d.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 space-y-2">
                  <div className="label-caps text-red-400/60 mb-3">Never do this</div>
                  {example.avoids.map(a => (
                    <div key={a} className="flex items-start gap-3">
                      <span className="text-red-400 text-[11px] mt-0.5 shrink-0">✗</span>
                      <span className="font-sans text-[13px] text-white/40 leading-relaxed">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="label-caps text-white/30 block mb-2">Paste your brief</label>
            <textarea
              value={customBrief}
              onChange={e => setCustomBrief(e.target.value)}
              placeholder='e.g. "We need authentic, community-driven content that showcases real performance..."'
              rows={5}
              className="w-full rounded-xl px-5 py-4 font-mono text-[13px] text-white/60 placeholder-white/15 focus:outline-none border transition-colors duration-200 resize-none leading-relaxed"
              style={{ background: '#141210', borderColor: '#2A2722' }}
            />
          </div>
          <div
            className="rounded-xl p-5 border border-dashed border-studio-brd/50 text-center"
          >
            <div className="font-sans text-[13px] text-white/30 mb-1">AI Translation</div>
            <div className="font-sans text-[11px] text-white/20">
              {customBrief.length > 20
                ? 'Translation engine ready — AI integration coming in Phase 2'
                : 'Enter a brief above to see it translated into actionable direction'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
