import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCampaigns } from '../../hooks/useCampaigns'

const ease = [0.16, 1, 0.3, 1] as const

const SIGNAL_COLORS: Record<string, string> = {
  new: '#EF4444',
  update: '#F5A653',
  alert: '#EAB308',
}

export default function LivingBriefPage() {
  const { livingBriefs, loading } = useCampaigns()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (livingBriefs.length > 0 && !selectedId) {
      setSelectedId(livingBriefs[0].id)
    }
  }, [livingBriefs, selectedId])

  useEffect(() => {
    const t = setInterval(() => setTick((c) => c + 1), 4000)
    return () => clearInterval(t)
  }, [])

  const selected = livingBriefs.find((b) => b.id === selectedId) ?? livingBriefs[0]

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">05 — Living Brief</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          Briefs that breathe with the campaign.
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2 max-w-md">
          Campaign requirements don&apos;t stay still. The Living Brief updates in real time — so your
          second video benefits from signals your first video generated.
        </p>
      </motion.div>

      {loading && (
        <div className="rounded-2xl p-12 border border-dashed border-studio-brd/50 text-center mb-6">
          <span className="font-sans text-[14px] text-white/25">Loading live briefs…</span>
        </div>
      )}

      {!loading && livingBriefs.length === 0 && (
        <div className="rounded-2xl p-12 border border-dashed border-studio-brd/50 text-center mb-6">
          <span className="font-sans text-[14px] text-white/25">No active briefs at the moment.</span>
        </div>
      )}

      {!loading && livingBriefs.length > 0 && (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            {livingBriefs.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-sans text-[12px] font-medium transition-all duration-150 ${
                  selectedId === b.id
                    ? 'border-ember-600/40 text-white'
                    : 'border-studio-brd text-white/40 hover:text-white/70'
                }`}
                style={{ background: selectedId === b.id ? 'rgba(217,124,40,0.06)' : '#141210' }}
              >
                <div className="relative shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
                </div>
                <span className="capitalize">{b.signal_type}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease }}
                className="rounded-2xl overflow-hidden border border-studio-brd mb-6"
                style={{ background: '#0F0E0B' }}
              >
                <div className="px-6 py-4 border-b border-studio-brd flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
                    </div>
                    <span className="label-caps text-emerald-400/80">Live</span>
                    <span
                      className="label-caps"
                      style={{ color: SIGNAL_COLORS[selected.signal_type] + '99', fontSize: 9 }}
                    >
                      {selected.signal_type.toUpperCase()}
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={tick}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-sans text-[11px] text-white/25"
                    >
                      ↺ Just updated
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="px-6 py-4 border-b border-studio-brd/50" style={{ background: 'rgba(28,26,23,0.3)' }}>
                  <div className="font-sans text-[12px] text-white/30 mt-0.5">
                    Active campaign signal
                  </div>
                </div>

                <div className="p-5">
                  <div
                    className="rounded-xl p-4 border border-studio-brd/50"
                    style={{ background: 'rgba(28,26,23,0.3)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: SIGNAL_COLORS[selected.signal_type] }}
                        />
                        <span
                          className="label-caps"
                          style={{ color: (SIGNAL_COLORS[selected.signal_type] ?? '#888') + '99', fontSize: 9 }}
                        >
                          {selected.signal_type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="font-sans text-[12px] text-white/50 leading-relaxed">
                      {selected.description}
                    </p>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mx-5 mb-5 rounded-xl p-4 border border-studio-brd/50"
                >
                  <div className="label-caps text-white/20 mb-3">Core requirements (unchanged)</div>
                  <div className="flex flex-wrap gap-2">
                    {["Creator's own voice", 'Open with motion', 'No voiceover', 'No promo codes', '60s max'].map(
                      (req) => (
                        <span
                          key={req}
                          className="font-sans text-[11px] text-white/35 px-2.5 py-1 rounded-md"
                          style={{ background: '#1C1A17' }}
                        >
                          {req}
                        </span>
                      ),
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease }}
        className="grid sm:grid-cols-2 gap-3"
      >
        {[
          'Real-time campaign performance signals',
          'Automatic requirement updates from brand data',
          'Creator notification on every brief change',
          'History of all updates with reasoning',
        ].map((feat) => (
          <div
            key={feat}
            className="flex items-start gap-3 rounded-xl px-4 py-3.5 border border-studio-brd"
            style={{ background: '#141210' }}
          >
            <span className="text-emerald-400 mt-0.5 shrink-0 text-sm">↗</span>
            <span className="font-sans text-[13px] text-white/50">{feat}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
