import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useCreatorDashboard } from '../../hooks/useCreatorDashboard'
import { CREATOR_TOOLS } from '../../mock/data'
import { formatINR } from '../../lib/format'

const ease = [0.16, 1, 0.3, 1] as const

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl p-5 border border-studio-brd" style={{ background: '#141210' }}>
      <div className="label-caps text-white/25 mb-3">{label}</div>
      <div className="font-serif font-light text-display-m text-white leading-none">{value}</div>
      {sub && <div className="font-sans text-[11px] text-white/30 mt-2">{sub}</div>}
    </div>
  )
}

const STATUS_STYLES = {
  active: { dot: 'bg-emerald-400', text: 'text-emerald-400/80', label: 'Active' },
  review: { dot: 'bg-amber-400', text: 'text-amber-400/80', label: 'In Review' },
  draft: { dot: 'bg-white/20', text: 'text-white/30', label: 'Draft' },
  completed: { dot: 'bg-white/30', text: 'text-white/40', label: 'Completed' },
  paused: { dot: 'bg-white/20', text: 'text-white/30', label: 'Paused' },
}

const TOOL_STATUS = {
  live: { bg: 'bg-emerald-400/10', text: 'text-emerald-400/70', label: 'Live' },
  beta: { bg: 'bg-amber-400/10', text: 'text-amber-400/70', label: 'Beta' },
}

export default function CreatorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading } = useCreatorDashboard()

  const activeCampaigns = data?.campaigns.filter((c) => c.status === 'active').length ?? 0
  const matchCount = data?.matchCount ?? 0
  const avgScore =
    data && data.matches.length > 0
      ? Math.round(data.matches.reduce((s, m) => s + m.compatibility_score, 0) / data.matches.length)
      : 0

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">Creator Dashboard</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          Good to see you, {user?.name?.split(' ')[0]}.
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2">
          Here&apos;s what&apos;s happening across your campaigns and tools.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
      >
        <StatCard
          label="Active Campaigns"
          value={loading ? '—' : activeCampaigns}
          sub="across brands"
        />
        <StatCard
          label="Avg Match Score"
          value={loading ? '—' : avgScore > 0 ? `${avgScore}%` : '—'}
          sub="voice alignment"
        />
        <StatCard
          label="Brand Matches"
          value={loading ? '—' : matchCount}
          sub="compatibility checked"
        />
        <StatCard
          label="Tools Available"
          value={CREATOR_TOOLS.length}
          sub="ready to use"
        />
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Tools grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-[13px] font-semibold text-white/50 uppercase tracking-wider">
              Your Tools
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {CREATOR_TOOLS.map((tool, i) => {
              const status = TOOL_STATUS[tool.status]
              return (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 + i * 0.04, ease }}
                  onClick={() => navigate(tool.path)}
                  className="text-left rounded-xl p-5 border border-studio-brd hover:border-studio-ele transition-all duration-200 group"
                  style={{ background: '#141210' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xl font-mono text-ember-400/60">{tool.icon}</span>
                    <span
                      className={`label-caps px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}
                      style={{ fontSize: 9 }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="font-sans text-[13px] font-semibold text-white/80 group-hover:text-white transition-colors mb-1.5">
                    {tool.name}
                  </div>
                  <div className="font-sans text-[11px] text-white/35 leading-relaxed">
                    {tool.desc}
                  </div>
                  <div className="mt-4 font-sans text-[11px] text-ember-400/50 group-hover:text-ember-400/80 transition-colors">
                    Open →
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Campaigns sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-[13px] font-semibold text-white/50 uppercase tracking-wider">
              Active Campaigns
            </h2>
            <span className="label-caps text-white/20">{data?.campaigns.length ?? 0} total</span>
          </div>

          <div className="space-y-3">
            {loading && (
              <div
                className="rounded-xl p-6 border border-studio-brd text-center"
                style={{ background: '#141210' }}
              >
                <span className="font-sans text-[12px] text-white/30">Loading campaigns…</span>
              </div>
            )}

            {!loading && data?.campaigns.length === 0 && (
              <div
                className="rounded-xl p-6 border border-studio-brd text-center"
                style={{ background: '#141210' }}
              >
                <span className="font-sans text-[12px] text-white/30">
                  No active campaigns yet.
                </span>
              </div>
            )}

            {data?.campaigns.map((c) => {
              const st = STATUS_STYLES[c.status] ?? STATUS_STYLES.draft
              return (
                <div
                  key={c.id}
                  className="rounded-xl p-4 border border-studio-brd"
                  style={{ background: '#141210' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-sans text-[12px] font-semibold text-white/80">
                        {c.brand?.name ?? 'Brand'}
                      </div>
                      <div className="font-sans text-[11px] text-white/35 mt-0.5 leading-relaxed">
                        {c.title}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="font-mono text-[11px] font-medium text-ember-400">
                        {formatINR(Number(c.budget))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                      <span className={`font-sans text-[10px] ${st.text}`}>{st.label}</span>
                    </div>
                    {c.deadline && (
                      <span className="font-sans text-[10px] text-white/25">
                        Due {new Date(c.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Match score summary */}
          {data && data.matches.length > 0 && (
            <div
              className="mt-4 rounded-xl p-4 border border-studio-brd/50"
              style={{ background: 'rgba(245,166,83,0.05)' }}
            >
              <div className="label-caps text-ember-400/60 mb-3">Top Brand Matches</div>
              <div className="space-y-2">
                {data.matches.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <span className="font-sans text-[11px] text-white/35 w-24 shrink-0 truncate">
                      {m.brand?.name ?? 'Brand'}
                    </span>
                    <div className="flex-1 h-1 rounded-full" style={{ background: '#2A2722' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${m.compatibility_score}%`, background: '#F5A653', opacity: 0.7 }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-white/30 w-7 text-right">
                      {m.compatibility_score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
