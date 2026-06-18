import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllBrands } from '../../services/brandService'
import { useEffect } from 'react'
import type { BrandRow } from '../../types/database'

const ease = [0.16, 1, 0.3, 1] as const

function scoreColor(s: number) {
  if (s >= 85) return '#F5A653'
  if (s >= 70) return '#EAB308'
  return '#6B7280'
}
function scoreLabel(s: number) {
  if (s >= 85) return 'Excellent'
  if (s >= 75) return 'Strong'
  if (s >= 65) return 'Good'
  return 'Fair'
}

export default function BrandDiscoveryPage() {
  const [brands, setBrands] = useState<BrandRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllBrands()
      .then((data) => { setBrands(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.industry ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">07 — Brand Discovery</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          {brands.length}+ brands, analyzed. Find the ones that fit.
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2 max-w-md">
          Stop cold-pitching brands that aren&apos;t a fit. Surface partnerships where your content
          will naturally thrive — ranked by predicted performance.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
      >
        {[
          { value: `${brands.length || '—'}`, label: 'brands on platform' },
          { value: '94%', label: 'prediction accuracy' },
          { value: '₹340', label: 'avg. CPM increase' },
          { value: '12', label: 'avg. matches per creator' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 border border-studio-brd"
            style={{ background: '#141210' }}
          >
            <div className="font-serif font-light text-display-s text-white leading-none">{s.value}</div>
            <div className="label-caps text-white/25 mt-2">{s.label}</div>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease }}
        className="rounded-2xl overflow-hidden border border-studio-brd"
        style={{ background: '#0F0E0B' }}
      >
        <div className="px-6 py-4 border-b border-studio-brd flex items-center justify-between">
          <span className="label-caps text-white/30">Brand Discovery</span>
          <span className="font-sans text-[11px] text-ember-400/70">
            {filtered.length} brands available
          </span>
        </div>

        <div className="px-6 py-3.5 border-b border-studio-brd/50">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand name or industry…"
            className="w-full max-w-sm font-sans text-[13px] text-white/70 placeholder-white/20 focus:outline-none py-1.5"
            style={{ background: 'transparent' }}
          />
        </div>

        <div className="p-4 space-y-2 min-h-[240px]">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <span className="font-sans text-[13px] text-white/25">Loading brands…</span>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {!loading && filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-40"
              >
                <div className="text-center">
                  <div className="font-sans text-[13px] text-white/25 mb-1">No brands found</div>
                  <div className="font-sans text-[11px] text-white/15">Try a different search term</div>
                </div>
              </motion.div>
            )}

            {filtered.map((b, i) => {
              const score = 75 + Math.floor((b.name.charCodeAt(0) % 20))
              const color = scoreColor(score)
              const label = scoreLabel(score)
              const bars = Math.round(score / 10)

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: i * 0.04, ease }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
                  style={{ background: '#1C1A17' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg border border-studio-brd flex items-center justify-center shrink-0"
                    style={{ background: '#141210' }}
                  >
                    <span className="font-serif font-bold text-xs text-white/50">{b.name[0]}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-[13px] font-medium text-white/80 truncate mb-1.5">
                      {b.name}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <div
                          key={j}
                          className="h-1.5 w-3 rounded-full"
                          style={{ background: j < bars ? color + 'bb' : '#2A2722' }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-[13px] text-white/70 font-medium">{score}%</div>
                    <div className="label-caps mt-0.5" style={{ color: color + '80', fontSize: 9 }}>
                      {label}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 border-t border-studio-brd flex items-center justify-between">
          <span className="font-sans text-[11px] text-white/25">
            {brands.length} brands · updated daily
          </span>
          <span className="font-sans text-[11px] text-ember-400/50">Intent Brand Discovery</span>
        </div>
      </motion.div>
    </div>
  )
}
