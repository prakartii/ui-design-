import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useCreatorDashboard } from '../../hooks/useCreatorDashboard'

const ease = [0.16, 1, 0.3, 1] as const

function MiniRing({ score, size = 40, color = '#F5A653' }: { score: number; size?: number; color?: string }) {
  const r = size / 2 - 4
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2A2722" strokeWidth="2.5" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x={size / 2}
        y={size / 2 + 4}
        textAnchor="middle"
        fill="white"
        fontSize={size * 0.21}
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        {score}%
      </text>
    </svg>
  )
}

function scoreColor(score: number) {
  if (score >= 85) return '#F5A653'
  if (score >= 70) return '#EAB308'
  return '#6B7280'
}

function scoreLabel(score: number) {
  if (score >= 85) return 'Excellent'
  if (score >= 75) return 'Strong'
  if (score >= 65) return 'Good'
  return 'Fair'
}

export default function CreatorMatchPage() {
  const { user } = useAuth()
  const { data, loading } = useCreatorDashboard()

  const creator = data?.creator
  const matches = data?.matches ?? []

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">03 — Creator Match Studio</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          Find the brands your voice was made for.
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2 max-w-md">
          Not follower count. Not niche. Voice match. Your content fingerprint vs. brand behavioral profiles.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease }}
        className="rounded-2xl overflow-hidden border border-studio-brd mb-6"
        style={{ background: '#0F0E0B' }}
      >
        <div className="px-6 py-5 border-b border-studio-brd flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ember-400 to-ember-800 flex items-center justify-center text-white font-serif text-lg shrink-0">
            {user?.name?.[0] ?? '?'}
          </div>
          <div>
            <div className="font-sans text-[15px] font-semibold text-white">
              @{creator?.handle ?? user?.name ?? 'you'}
            </div>
            <div className="font-sans text-[11px] text-white/35 mt-0.5">
              {creator?.niche ?? '—'} · {(creator?.followers ?? 0).toLocaleString('en-IN')} followers
            </div>
          </div>
          <div className="ml-auto label-caps text-ember-400/60">
            {loading ? '—' : matches.length} matches
          </div>
        </div>

        <div className="p-5 border-b border-studio-brd/50">
          <div className="label-caps text-white/25 mb-4">Voice signature</div>
          <div className="space-y-3">
            {[
              { trait: 'Raw authenticity', match: 95 },
              { trait: 'Achievement narrative', match: 88 },
              { trait: 'Community focus', match: 72 },
            ].map((t) => (
              <div key={t.trait} className="flex items-center gap-3">
                <span className="font-sans text-[12px] text-white/40 w-40 shrink-0">{t.trait}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: '#2A2722' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${t.match}%`, background: '#F5A653', opacity: 0.7 }}
                  />
                </div>
                <span className="font-mono text-[11px] text-white/35 w-8 text-right">
                  {t.match}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="label-caps text-white/25 mb-4">Matched brands</div>

          {loading && (
            <p className="font-sans text-[12px] text-white/25 py-4">Loading matches…</p>
          )}

          {!loading && matches.length === 0 && (
            <p className="font-sans text-[12px] text-white/25 py-4">
              No brand matches yet. Complete your profile to get matched.
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {matches.map((m, i) => {
              const color = scoreColor(m.compatibility_score)
              const label = scoreLabel(m.compatibility_score)
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease }}
                  className="rounded-xl p-4 border border-studio-brd/60"
                  style={{ background: '#1C1A17' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-lg border border-studio-brd flex items-center justify-center"
                      style={{ background: '#141210' }}
                    >
                      <span className="font-serif font-bold text-xs text-white/60">
                        {m.brand?.name?.[0] ?? '?'}
                      </span>
                    </div>
                    <MiniRing score={m.compatibility_score} size={36} color={color} />
                  </div>
                  <div className="font-sans text-[13px] font-medium text-white/80">
                    {m.brand?.name ?? 'Brand'}
                  </div>
                  <div
                    className="label-caps mt-1"
                    style={{ color: color + 'aa', fontSize: 9 }}
                  >
                    {label}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease }}
        className="grid md:grid-cols-3 gap-4"
      >
        {[
          { icon: '◈', title: 'Voice fingerprint', desc: 'Analyzed across 200+ content signals from your existing work.' },
          { icon: '↗', title: 'Ranked matches', desc: 'Sorted by predicted approval rate from 847 analyzed brands.' },
          { icon: '✓', title: 'Predicted outcomes', desc: 'Know your approval probability before you pitch a single brand.' },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl p-5 border border-studio-brd"
            style={{ background: '#141210' }}
          >
            <span className="text-ember-400 text-lg">{f.icon}</span>
            <div className="font-sans text-[13px] font-semibold text-white mt-3">{f.title}</div>
            <div className="font-sans text-[12px] text-white/35 mt-2 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
