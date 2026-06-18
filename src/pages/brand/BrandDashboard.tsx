import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useBrandDashboard } from '../../hooks/useBrandDashboard'
import { formatINR } from '../../lib/format'

const ease = [0.16, 1, 0.3, 1] as const

const STATUS_STYLES = {
  active: { dot: 'bg-emerald-400', badge: 'text-emerald-400/80', label: 'Active' },
  draft: { dot: 'bg-white/20', badge: 'text-white/30', label: 'Draft' },
  completed: { dot: 'bg-white/30', badge: 'text-white/40', label: 'Completed' },
  paused: { dot: 'bg-amber-400', badge: 'text-amber-400/80', label: 'Paused' },
}

export default function BrandDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading } = useBrandDashboard()

  const stats = data?.stats

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">Brand Dashboard</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          Good to see you, {user?.name?.split(' ')[0]}.
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2">
          Track your campaigns, creators, and performance from one workspace.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
      >
        {[
          { label: 'Active Campaigns', value: loading ? '—' : (stats?.active ?? 0), sub: 'in progress' },
          { label: 'Total Campaigns', value: loading ? '—' : (stats?.total ?? 0), sub: 'all time' },
          { label: 'Total Budget', value: loading ? '—' : formatINR(stats?.totalBudget ?? 0), sub: 'allocated' },
          { label: 'Completed', value: loading ? '—' : (stats?.completed ?? 0), sub: 'campaigns finished' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-5 border border-studio-brd" style={{ background: '#141210' }}>
            <div className="label-caps text-white/25 mb-3">{s.label}</div>
            <div className="font-serif font-light text-display-m text-white leading-none">{s.value}</div>
            {s.sub && <div className="font-sans text-[11px] text-white/30 mt-2">{s.sub}</div>}
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-[13px] font-semibold text-white/50 uppercase tracking-wider">
              Campaigns
            </h2>
            <button
              onClick={() => navigate('/brand/campaigns')}
              className="font-sans text-[11px] text-ember-400/60 hover:text-ember-400 transition-colors"
            >
              View all →
            </button>
          </div>

          <div className="space-y-3">
            {loading && (
              <div className="rounded-xl p-6 border border-studio-brd text-center" style={{ background: '#141210' }}>
                <span className="font-sans text-[12px] text-white/30">Loading campaigns…</span>
              </div>
            )}

            {!loading && data?.campaigns.length === 0 && (
              <div className="rounded-xl p-6 border border-studio-brd text-center" style={{ background: '#141210' }}>
                <span className="font-sans text-[12px] text-white/30">No campaigns yet.</span>
              </div>
            )}

            {data?.campaigns.slice(0, 4).map((c, i) => {
              const st = STATUS_STYLES[c.status] ?? STATUS_STYLES.draft
              const spentPct = stats && stats.totalBudget > 0
                ? Math.min(100, Math.round((stats.spent / stats.totalBudget) * 100))
                : 0

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.12 + i * 0.06, ease }}
                  className="rounded-xl p-5 border border-studio-brd"
                  style={{ background: '#141210' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-sans text-[13px] font-semibold text-white/80">{c.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                        <span className={`font-sans text-[11px] ${st.badge}`}>{st.label}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="font-mono text-[12px] font-medium text-ember-400">
                        {formatINR(Number(c.budget))}
                      </div>
                    </div>
                  </div>

                  {c.status !== 'draft' && Number(c.budget) > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-sans text-[11px] text-white/25">Budget utilisation</span>
                        <span className="font-sans text-[11px] text-white/40">{spentPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: '#2A2722' }}>
                        <div
                          className="h-full rounded-full bg-ember-600"
                          style={{ width: `${spentPct}%`, opacity: 0.7 }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Top creators */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-[13px] font-semibold text-white/50 uppercase tracking-wider">
              Top Creator Matches
            </h2>
            <button
              onClick={() => navigate('/brand/creators')}
              className="font-sans text-[11px] text-ember-400/60 hover:text-ember-400 transition-colors"
            >
              View all →
            </button>
          </div>

          <div className="space-y-3">
            {!loading && data?.topMatches.length === 0 && (
              <div className="rounded-xl p-5 border border-dashed border-studio-brd/50 text-center">
                <span className="font-sans text-[12px] text-white/30">No matches yet.</span>
              </div>
            )}

            {data?.topMatches.slice(0, 4).map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.06, ease }}
                className="flex items-center gap-3 rounded-xl p-4 border border-studio-brd"
                style={{ background: '#141210' }}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ember-400 to-ember-800 flex items-center justify-center text-white font-serif text-sm shrink-0">
                  {m.creator?.handle?.[1]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-[13px] font-medium text-white/80 truncate">
                    @{m.creator?.handle ?? 'creator'}
                  </div>
                  <div className="font-sans text-[10px] text-white/30 mt-0.5">
                    {m.creator?.niche ?? '—'} · {(m.creator?.followers ?? 0).toLocaleString('en-IN')} followers
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-[12px] font-medium text-ember-400">
                    {m.compatibility_score}%
                  </div>
                  <div className="font-sans text-[10px] mt-0.5 text-white/25">match</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 rounded-xl p-4 border border-dashed border-studio-brd/50 text-center">
            <div className="font-sans text-[12px] text-white/30 mb-1">Discover creators</div>
            <div className="font-sans text-[11px] text-white/20">
              Intent matches your brand brief with creator voice signatures
            </div>
            <button
              onClick={() => navigate('/brand/creators')}
              className="mt-3 font-sans text-[11px] font-medium text-ember-400/60 hover:text-ember-400 transition-colors"
            >
              Find creators →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
