import { motion } from 'framer-motion'
import { useBrandDashboard } from '../../hooks/useBrandDashboard'
import { formatINR } from '../../lib/format'

const ease = [0.16, 1, 0.3, 1] as const

export default function AnalyticsPage() {
  const { data, loading } = useBrandDashboard()

  const stats = data?.stats
  const campaigns = data?.campaigns ?? []
  const matches = data?.topMatches ?? []

  const avgMatchScore =
    matches.length > 0
      ? Math.round(matches.reduce((s, m) => s + m.compatibility_score, 0) / matches.length)
      : 0

  const spentPct =
    stats && stats.totalBudget > 0
      ? Math.round((stats.spent / stats.totalBudget) * 100)
      : 0

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
          Analytics
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2">
          Campaign performance, creator match scores, and budget utilisation.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
      >
        {[
          {
            label: 'Total Budget',
            value: loading ? '—' : formatINR(stats?.totalBudget ?? 0),
            change: `${campaigns.length} campaigns`,
            pos: true,
          },
          {
            label: 'Budget Spent',
            value: loading ? '—' : formatINR(stats?.spent ?? 0),
            change: `${spentPct}% utilised`,
            pos: true,
          },
          {
            label: 'Avg Match Score',
            value: loading ? '—' : avgMatchScore > 0 ? `${avgMatchScore}%` : '—',
            change: 'voice compatibility',
            pos: true,
          },
          {
            label: 'Active Campaigns',
            value: loading ? '—' : (stats?.active ?? 0),
            change: `${stats?.completed ?? 0} completed`,
            pos: true,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-5 border border-studio-brd"
            style={{ background: '#141210' }}
          >
            <div className="label-caps text-white/25 mb-3">{s.label}</div>
            <div className="font-serif font-light text-display-m text-white leading-none mb-2">
              {s.value}
            </div>
            <div className="font-sans text-[11px] text-emerald-400/60">{s.change}</div>
          </div>
        ))}
      </motion.div>

      {/* Budget by campaign */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease }}
        className="rounded-2xl overflow-hidden border border-studio-brd mb-6"
        style={{ background: '#0F0E0B' }}
      >
        <div className="px-6 py-4 border-b border-studio-brd">
          <span className="label-caps text-white/30">Budget Utilisation by Campaign</span>
        </div>
        <div className="p-5 space-y-4">
          {loading && (
            <p className="font-sans text-[12px] text-white/25 text-center py-4">
              Loading…
            </p>
          )}
          {!loading && campaigns.length === 0 && (
            <p className="font-sans text-[12px] text-white/25 text-center py-4">
              No campaigns yet.
            </p>
          )}
          {campaigns.filter((c) => Number(c.budget) > 0).map((c) => (
            <div key={c.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-[13px] text-white/65 truncate pr-4">{c.title}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-sans text-[11px] text-white/35">
                    {formatINR(Number(c.budget))}
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full" style={{ background: '#2A2722' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: c.status === 'completed' ? '100%' : c.status === 'active' ? '65%' : '0%',
                    background: '#D97C28',
                    opacity: 0.75,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Creator match distribution */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease }}
        className="rounded-2xl overflow-hidden border border-studio-brd mb-6"
        style={{ background: '#0F0E0B' }}
      >
        <div className="px-6 py-4 border-b border-studio-brd flex items-center justify-between">
          <span className="label-caps text-white/30">Creator Match Scores</span>
          {avgMatchScore > 0 && (
            <span className="font-sans text-[11px] text-ember-400/60">{avgMatchScore}% average</span>
          )}
        </div>
        <div className="p-5 space-y-3">
          {!loading && matches.length === 0 && (
            <p className="font-sans text-[12px] text-white/25 text-center py-4">
              No creator matches yet.
            </p>
          )}
          {matches.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.07, ease }}
              className="flex items-center gap-4"
            >
              <span className="font-sans text-[12px] text-white/50 w-36 shrink-0 truncate">
                @{m.creator?.handle ?? 'creator'}
              </span>
              <div className="flex-1 h-2 rounded-full" style={{ background: '#2A2722' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${m.compatibility_score}%`,
                    background: '#F5A653',
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className="font-mono text-[12px] text-white/50 w-10 text-right">
                {m.compatibility_score}%
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="rounded-2xl p-8 border border-dashed border-studio-brd/50 text-center"
      >
        <div className="font-sans text-[13px] font-medium text-white/30 mb-2">
          Advanced Analytics
        </div>
        <div className="font-sans text-[12px] text-white/20 max-w-sm mx-auto leading-relaxed">
          CTR by creator, approval rate trends, voice match vs. performance correlation, and
          campaign ROI analysis — coming soon.
        </div>
      </motion.div>
    </div>
  )
}
