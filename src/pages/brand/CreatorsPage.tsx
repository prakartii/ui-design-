import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCreators } from '../../hooks/useCreators'

const ease = [0.16, 1, 0.3, 1] as const

function MiniRing({ score, size = 36 }: { score: number; size?: number }) {
  const r = size / 2 - 3
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2A2722" strokeWidth="2" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#F5A653"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x={size / 2}
        y={size / 2 + 3}
        textAnchor="middle"
        fill="white"
        fontSize={size * 0.22}
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        {score}%
      </text>
    </svg>
  )
}

export default function CreatorsPage() {
  const [search, setSearch] = useState('')
  const { creators, loading } = useCreators()

  const filtered = creators.filter(
    (c) =>
      (c.handle ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.niche ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">Brand Portal</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          Creators
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2">
          Discover and manage creator partnerships matched to your brand voice.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 text-sm pointer-events-none">
            ⌕
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creators by handle or niche…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border font-sans text-[13px] text-white/70 placeholder-white/20 focus:outline-none transition-colors duration-200"
            style={{ background: '#141210', borderColor: '#2A2722' }}
          />
        </div>
        <div
          className="flex items-center gap-4 px-4 py-2.5 rounded-xl border border-studio-brd"
          style={{ background: '#141210' }}
        >
          <span className="font-sans text-[12px] text-white/30">
            <span className="text-white/60 font-medium">{creators.length}</span> creators total
          </span>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <div className="col-span-full rounded-2xl p-12 border border-dashed border-studio-brd/50 text-center">
            <span className="font-sans text-[14px] text-white/25">Loading creators…</span>
          </div>
        )}

        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease }}
            className="rounded-2xl p-5 border border-studio-brd"
            style={{ background: '#141210' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ember-400 to-ember-800 flex items-center justify-center text-white font-serif shrink-0">
                  {(c.handle ?? c.niche ?? '?')[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-sans text-[13px] font-semibold text-white/80">
                    @{c.handle ?? 'creator'}
                  </div>
                  <div className="font-sans text-[11px] text-white/35 mt-0.5">
                    {c.niche ?? '—'}
                  </div>
                </div>
              </div>
              <MiniRing score={75} size={36} />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-sans text-[11px] text-white/35 truncate">
                {c.niche ?? 'Content creator'}
              </span>
              <span className="text-white/15">·</span>
              <span className="font-sans text-[11px] text-white/40 shrink-0">
                {c.followers.toLocaleString('en-IN')} followers
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="label-caps text-white/20">Followers</span>
                <span className="font-mono text-[11px] text-ember-400/70">
                  {c.followers >= 1000000
                    ? `${(c.followers / 1000000).toFixed(1)}M`
                    : c.followers >= 1000
                    ? `${(c.followers / 1000).toFixed(0)}K`
                    : c.followers}
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: '#2A2722' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (c.followers / 500000) * 100)}%`,
                    background: '#F5A653',
                    opacity: 0.65,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] text-emerald-400/70">Active</span>
              <button className="font-sans text-[11px] font-medium text-white/35 hover:text-white/70 transition-colors">
                View profile →
              </button>
            </div>
          </motion.div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full rounded-2xl p-12 border border-dashed border-studio-brd/50 text-center">
            <div className="font-sans text-[14px] text-white/25 mb-1">
              No creators match your search
            </div>
            <div className="font-sans text-[12px] text-white/15">Try a different handle or niche</div>
          </div>
        )}
      </div>
    </div>
  )
}
