import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useCreatorStore } from '../../context/CreatorStoreContext'
import { CREATOR_TOOLS } from '../../mock/data'
import { getRiskColor, getRiskLabel, LEVEL_CONFIG } from '../../services/rejectionPreventionService'
import { CATEGORY_CONFIG } from '../../services/livingBriefService'
import { CATEGORY_COLORS, DIFFICULTY_CONFIG } from '../../services/brandDiscoveryService'
import { formatFollowers, formatEarnings } from '../../services/creatorMatchService'

const ease = [0.16, 1, 0.3, 1] as const

// ── Preserved stat card ────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: string
}) {
  return (
    <div className="rounded-xl p-5 border border-studio-brd" style={{ background: '#141210' }}>
      <div className="label-caps text-white/25 mb-3">{label}</div>
      <div
        className="font-serif font-light text-display-m leading-none"
        style={{ color: accent ?? 'white' }}
      >
        {value}
      </div>
      {sub && <div className="font-sans text-[11px] text-white/30 mt-2">{sub}</div>}
    </div>
  )
}

// ── Tool status preserved ──────────────────────────────────────

const TOOL_STATUS = {
  live: { bg: 'bg-emerald-400/10', text: 'text-emerald-400/70', label: 'Live' },
  beta: { bg: 'bg-amber-400/10', text: 'text-amber-400/70', label: 'Beta' },
}

// ── Risk badge ─────────────────────────────────────────────────

function RiskBadge({ score }: { score: number }) {
  const color = getRiskColor(score)
  return (
    <span
      className="font-mono text-[10px] px-2 py-0.5 rounded font-semibold"
      style={{ color, background: color + '18' }}
    >
      {score}
    </span>
  )
}

// ── Section heading ────────────────────────────────────────────

function SectionHeading({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-sans text-[13px] font-semibold text-white/50 uppercase tracking-wider">
        {title}
      </h2>
      {count !== undefined && (
        <span className="label-caps text-white/20">{count} total</span>
      )}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────

function EmptyCard({ message, action, path }: { message: string; action?: string; path?: string }) {
  const navigate = useNavigate()
  return (
    <div
      className="rounded-xl p-5 border border-studio-brd/50 text-center"
      style={{ background: '#141210' }}
    >
      <p className="font-sans text-[12px] text-white/25 mb-2">{message}</p>
      {action && path && (
        <button
          onClick={() => navigate(path)}
          className="font-sans text-[11px] text-ember-400/60 hover:text-ember-400/90 transition-colors"
        >
          {action} →
        </button>
      )}
    </div>
  )
}

// ── Main dashboard ─────────────────────────────────────────────

export default function CreatorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    analysisHistory,
    savedBrandIds,
    allBrands,
    matchResult,
    briefFeed,
    briefUnread,
  } = useCreatorStore()

  // Derived data
  const savedBrands = allBrands.filter((b) => savedBrandIds.has(b.id))
  const avgMatchScore =
    matchResult && matchResult.matches.length > 0
      ? Math.round(
          matchResult.matches.reduce((s, m) => s + m.compatibilityScore, 0) /
            matchResult.matches.length,
        )
      : null
  const recentAnalyses = analysisHistory.slice(0, 3)
  const recentFeed = briefFeed.slice(0, 4)
  const topMatches = matchResult?.matches.slice(0, 3) ?? []

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">Command Center</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          Good to see you, {user?.name?.split(' ')[0]}.
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2">
          Everything across your tools, live.
        </p>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
      >
        <StatCard
          label="Risk Analyses"
          value={analysisHistory.length}
          sub="content reviews run"
        />
        <StatCard
          label="Avg Match Score"
          value={avgMatchScore !== null ? `${avgMatchScore}%` : '—'}
          sub={matchResult ? `${matchResult.matches.length} brands ranked` : 'run creator match'}
          accent={avgMatchScore !== null ? '#F5A653' : undefined}
        />
        <StatCard
          label="Saved Brands"
          value={savedBrandIds.size}
          sub={savedBrandIds.size > 0 ? `of 102 discovered` : 'discover brands to save'}
        />
        <StatCard
          label="Brief Updates"
          value={briefUnread > 0 ? `+${briefUnread}` : briefFeed.length}
          sub={briefUnread > 0 ? 'unread intelligence' : 'signals tracked'}
          accent={briefUnread > 0 ? '#F5A653' : undefined}
        />
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">

        {/* ── Left: tools + analyses ── */}
        <div className="space-y-6">

          {/* Tool cards — preserved exactly */}
          <div>
            <SectionHeading title="Your Tools" />
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

          {/* Recent risk analyses */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
          >
            <SectionHeading title="Recent Risk Reports" count={analysisHistory.length} />
            {recentAnalyses.length === 0 ? (
              <EmptyCard
                message="No analyses yet. Paste a script and run a review."
                action="Open Rejection Prevention"
                path="/creator/rejection-prevention"
              />
            ) : (
              <div className="space-y-2.5">
                <AnimatePresence>
                  {recentAnalyses.map((a, i) => {
                    const riskColor = getRiskColor(a.riskScore)
                    const critical = a.issues.filter((x) => x.level === 'critical').length
                    const high = a.issues.filter((x) => x.level === 'high').length
                    return (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.06, ease }}
                        className="rounded-xl p-4 border border-studio-brd flex items-center gap-4 cursor-pointer hover:border-studio-ele transition-all duration-150"
                        style={{ background: '#141210' }}
                        onClick={() => navigate('/creator/rejection-prevention')}
                      >
                        {/* Risk ring */}
                        <div
                          className="w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0"
                          style={{ borderColor: riskColor + '50', background: riskColor + '12' }}
                        >
                          <span className="font-mono text-[11px] font-bold" style={{ color: riskColor }}>
                            {a.riskScore}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-sans text-[12px] font-medium text-white/75 truncate">
                            {a.contentSnippet.slice(0, 60)}{a.contentSnippet.length > 60 ? '…' : ''}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="label-caps text-white/25" style={{ fontSize: 9 }}>
                              {a.contentType}
                            </span>
                            {critical > 0 && (
                              <span className="font-sans text-[10px]" style={{ color: LEVEL_CONFIG.critical.color }}>
                                {critical} critical
                              </span>
                            )}
                            {high > 0 && (
                              <span className="font-sans text-[10px]" style={{ color: LEVEL_CONFIG.high.color }}>
                                {high} high
                              </span>
                            )}
                            {a.issues.length === 0 && (
                              <span className="font-sans text-[10px]" style={{ color: '#22C55E' }}>
                                Clean
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-sans text-[10px] text-white/20">
                            {a.approvalProbability}% approval
                          </div>
                          <div className="font-sans text-[9px] text-white/15 mt-0.5" style={{ color: riskColor + '80' }}>
                            {getRiskLabel(a.riskScore)}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                {analysisHistory.length > 3 && (
                  <button
                    onClick={() => navigate('/creator/rejection-prevention')}
                    className="font-sans text-[11px] text-white/20 hover:text-white/45 transition-colors w-full text-center py-1"
                  >
                    +{analysisHistory.length - 3} more in history →
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Right sidebar ── */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          className="space-y-6"
        >

          {/* Top brand matches */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans text-[13px] font-semibold text-white/50 uppercase tracking-wider">
                Top Brand Matches
              </h2>
              <button
                onClick={() => navigate('/creator/creator-match')}
                className="font-sans text-[10px] text-ember-400/50 hover:text-ember-400/80 transition-colors"
              >
                {matchResult ? 'Update →' : 'Run →'}
              </button>
            </div>

            {topMatches.length === 0 ? (
              <EmptyCard
                message="No match analysis yet."
                action="Run Creator Match"
                path="/creator/creator-match"
              />
            ) : (
              <div
                className="rounded-xl p-4 border border-studio-brd/50 space-y-3"
                style={{ background: 'rgba(245,166,83,0.04)' }}
              >
                {matchResult && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-studio-brd/30">
                    <span className="label-caps text-white/25" style={{ fontSize: 9 }}>
                      {matchResult.profile.niche}
                    </span>
                    <span className="text-white/15">·</span>
                    <span className="label-caps text-white/25" style={{ fontSize: 9 }}>
                      {formatFollowers(matchResult.profile.followers)} followers
                    </span>
                    <span className="text-white/15">·</span>
                    <span className="label-caps text-white/25" style={{ fontSize: 9 }}>
                      {matchResult.profile.platform}
                    </span>
                  </div>
                )}
                {topMatches.map((m) => (
                  <div key={m.brandId} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded border border-studio-brd flex items-center justify-center shrink-0"
                      style={{ background: '#141210' }}
                    >
                      <span className="font-serif text-[9px] font-bold text-white/50">
                        {m.brandName[0]}
                      </span>
                    </div>
                    <span className="font-sans text-[11px] text-white/40 flex-1 truncate">
                      {m.brandName}
                    </span>
                    <div className="flex-1 h-1 rounded-full" style={{ background: '#2A2722' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${m.compatibilityScore}%`,
                          background: '#F5A653',
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-white/30 w-7 text-right shrink-0">
                      {m.compatibilityScore}%
                    </span>
                  </div>
                ))}
                {matchResult && matchResult.matches.length > 3 && (
                  <p className="font-sans text-[10px] text-white/20 pt-1">
                    +{matchResult.matches.length - 3} more matches
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Saved brands */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans text-[13px] font-semibold text-white/50 uppercase tracking-wider">
                Saved Brands
              </h2>
              <button
                onClick={() => navigate('/creator/brand-discovery')}
                className="font-sans text-[10px] text-ember-400/50 hover:text-ember-400/80 transition-colors"
              >
                Discover →
              </button>
            </div>

            {savedBrands.length === 0 ? (
              <EmptyCard
                message="No saved brands. Discover brands that fit your voice."
                action="Open Brand Discovery"
                path="/creator/brand-discovery"
              />
            ) : (
              <div
                className="rounded-xl p-4 border border-studio-brd"
                style={{ background: '#141210' }}
              >
                <div className="space-y-2.5">
                  {savedBrands.slice(0, 5).map((b) => {
                    const catColor = CATEGORY_COLORS[b.category]
                    const diff = DIFFICULTY_CONFIG[b.difficulty]
                    return (
                      <div
                        key={b.id}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/creator/brand-discovery')}
                      >
                        <div
                          className="w-6 h-6 rounded border flex items-center justify-center shrink-0"
                          style={{ background: catColor + '14', borderColor: catColor + '30' }}
                        >
                          <span className="font-serif text-[9px] font-bold" style={{ color: catColor }}>
                            {b.name[0]}
                          </span>
                        </div>
                        <span className="font-sans text-[12px] text-white/55 flex-1 truncate group-hover:text-white/80 transition-colors">
                          {b.name}
                        </span>
                        <span
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded shrink-0"
                          style={{ color: diff.color, background: diff.bg }}
                        >
                          {diff.label}
                        </span>
                        <span className="font-mono text-[10px] text-white/25 shrink-0">
                          {b.compatibilityScore}%
                        </span>
                      </div>
                    )
                  })}
                </div>
                {savedBrands.length > 5 && (
                  <button
                    onClick={() => navigate('/creator/brand-discovery')}
                    className="font-sans text-[10px] text-white/20 hover:text-white/40 transition-colors mt-3 block"
                  >
                    +{savedBrands.length - 5} more saved →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Living brief feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans text-[13px] font-semibold text-white/50 uppercase tracking-wider">
                Brief Intelligence
              </h2>
              <div className="flex items-center gap-3">
                {briefUnread > 0 && (
                  <motion.span
                    key={briefUnread}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    className="font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: '#EF4444', color: 'white' }}
                  >
                    {briefUnread}
                  </motion.span>
                )}
                <button
                  onClick={() => navigate('/creator/living-brief')}
                  className="font-sans text-[10px] text-ember-400/50 hover:text-ember-400/80 transition-colors"
                >
                  Full feed →
                </button>
              </div>
            </div>

            {recentFeed.length === 0 ? (
              <EmptyCard
                message="No brief intelligence yet. The feed generates live signals."
                action="Open Living Brief"
                path="/creator/living-brief"
              />
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {recentFeed.map((event, i) => {
                    const cfg = CATEGORY_CONFIG[event.category]
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28, delay: i * 0.05, ease }}
                        className="rounded-xl px-3.5 py-3 border cursor-pointer hover:brightness-110 transition-all duration-150"
                        style={{
                          background: event.read ? '#141210' : cfg.bg,
                          borderColor: event.read ? 'rgba(42,39,34,1)' : cfg.border,
                        }}
                        onClick={() => navigate('/creator/living-brief')}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className="font-mono text-[11px] shrink-0 mt-0.5"
                            style={{ color: cfg.color }}
                          >
                            {cfg.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-sans text-[11px] font-medium text-white/70 leading-snug">
                              {event.title}
                            </div>
                            {event.metric && (
                              <span
                                className="font-mono text-[9px] mt-0.5 inline-block"
                                style={{ color: cfg.color }}
                              >
                                {event.delta === 'up' ? '↑' : event.delta === 'down' ? '↓' : '→'}{' '}
                                {event.metric}
                              </span>
                            )}
                          </div>
                          {!event.read && (
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                              style={{ background: cfg.color }}
                            />
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Voice signature summary */}
          {matchResult && matchResult.voiceSignature.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sans text-[13px] font-semibold text-white/50 uppercase tracking-wider">
                  Voice Signature
                </h2>
                <button
                  onClick={() => navigate('/creator/creator-match')}
                  className="font-sans text-[10px] text-white/20 hover:text-white/45 transition-colors"
                >
                  Update →
                </button>
              </div>
              <div
                className="rounded-xl p-4 border border-studio-brd/50 space-y-2.5"
                style={{ background: '#141210' }}
              >
                {matchResult.voiceSignature.map((t) => (
                  <div key={t.trait} className="flex items-center gap-3">
                    <span className="font-sans text-[10px] text-white/35 w-40 shrink-0 truncate">
                      {t.trait}
                    </span>
                    <div className="flex-1 h-1 rounded-full" style={{ background: '#2A2722' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${t.score}%`, background: '#F5A653', opacity: 0.55 }}
                      />
                    </div>
                    <span className="font-mono text-[9px] text-white/25 w-6 text-right shrink-0">
                      {t.score}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
