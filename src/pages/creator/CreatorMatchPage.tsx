import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import {
  runMatchAnalysis,
  loadMatchResult,
  saveMatchResult,
  clearMatchResult,
  formatFollowers,
  formatEarnings,
  getFollowerTierLabel,
  LOADING_STEPS,
  NICHES,
  CONTENT_STYLES,
  PLATFORMS,
  DIFFICULTY_CONFIG,
  type CreatorProfile,
  type MatchResult,
  type BrandMatch,
  type BrandDifficulty,
} from '../../services/creatorMatchService'

const ease = [0.16, 1, 0.3, 1] as const

// ── Preserved: MiniRing ───────────────────────────────────────

function MiniRing({ score, size = 40, color = '#F5A653' }: { score: number; size?: number; color?: string }) {
  const r = size / 2 - 4
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2A2722" strokeWidth="2.5" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x={size / 2} y={size / 2 + 4}
        textAnchor="middle" fill="white"
        fontSize={size * 0.21} fontWeight="600" fontFamily="Inter, sans-serif"
      >
        {score}%
      </text>
    </svg>
  )
}

// ── Preserved: score helpers ──────────────────────────────────

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

// ── Loading card ──────────────────────────────────────────────

function LoadingCard({ step }: { step: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease }}
      className="rounded-2xl overflow-hidden border border-studio-brd"
      style={{ background: '#0F0E0B' }}
    >
      <div className="px-6 py-5 border-b border-studio-brd flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(245,166,83,0.1)', border: '1px solid rgba(245,166,83,0.2)' }}
        >
          <motion.span
            className="font-serif text-lg"
            style={{ color: '#F5A653' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            ◈
          </motion.span>
        </div>
        <div>
          <div className="font-sans text-[15px] font-semibold text-white">Analyzing match profile…</div>
          <div className="font-sans text-[11px] text-white/35 mt-0.5">This takes a moment</div>
        </div>
        <div className="ml-auto flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#F5A653' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.1, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-xs mx-auto space-y-4 mb-8">
          {LOADING_STEPS.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: i <= step ? 1 : 0.2, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300"
                style={{
                  background: i < step ? 'rgba(34,197,94,0.15)' : i === step ? 'rgba(245,166,83,0.1)' : 'transparent',
                  borderColor: i < step ? 'rgba(34,197,94,0.35)' : i === step ? 'rgba(245,166,83,0.4)' : 'rgba(255,255,255,0.1)',
                }}
              >
                {i < step ? (
                  <span style={{ color: '#4ADE80', fontSize: '9px' }}>✓</span>
                ) : i === step ? (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#F5A653' }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.75, repeat: Infinity }}
                  />
                ) : null}
              </div>
              <span
                className="font-sans text-[12px] transition-colors duration-300"
                style={{
                  color: i < step ? 'rgba(74,222,128,0.7)' : i === step ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)',
                }}
              >
                {msg}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="max-w-xs mx-auto h-1 rounded-full overflow-hidden" style={{ background: '#2A2722' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#D97C28' }}
            animate={{ width: `${((step + 1) / LOADING_STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ── Select field ──────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  placeholder: string
}) {
  return (
    <div>
      <label className="label-caps text-white/25 mb-2 block" style={{ fontSize: '9px' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full font-sans text-[13px] py-2.5 px-3 rounded-xl border border-studio-brd focus:outline-none transition-colors appearance-none"
        style={{ background: '#141210', color: value ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}
      >
        <option value="" style={{ color: 'rgba(255,255,255,0.3)' }}>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

// ── Match explain panel ───────────────────────────────────────

function MatchExplainPanel({
  match,
  onClose,
}: {
  match: BrandMatch
  onClose: () => void
}) {
  const color = scoreColor(match.compatibilityScore)
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.32, ease }}
      className="overflow-hidden border-t border-studio-brd/50"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="label-caps text-white/25 mb-1" style={{ fontSize: '9px' }}>Match Explanation</div>
            <div className="font-sans text-[14px] font-semibold text-white">
              Matched with {match.brandName} because:
            </div>
          </div>
          <button
            onClick={onClose}
            className="font-sans text-[18px] text-white/25 hover:text-white/60 transition-colors"
          >
            ×
          </button>
        </div>
        <div className="space-y-3">
          {match.reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07, ease }}
              className="flex items-start gap-3"
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: color + '18', border: `1px solid ${color}30` }}
              >
                <span className="font-mono text-[9px]" style={{ color }}>*</span>
              </div>
              <p className="font-sans text-[12px] text-white/55 leading-relaxed">{reason}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-6">
          {[
            { label: 'Compatibility', value: `${match.compatibilityScore}%`, color },
            { label: 'Approval Rate', value: `${match.approvalRate}%`, color: '#22C55E' },
            { label: 'Est. Earnings', value: formatEarnings(match.earningsMin, match.earningsMax), color: '#F5A653' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-mono text-[13px] font-semibold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="label-caps mt-0.5" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Compare panel ─────────────────────────────────────────────

function ComparePanel({
  matches,
  onRemove,
}: {
  matches: BrandMatch[]
  onRemove: (id: string) => void
}) {
  const cols = matches.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease }}
      className="overflow-hidden border-t border-studio-brd/50"
    >
      <div className="p-5">
        <div className="label-caps text-white/25 mb-4">Comparison mode</div>
        <div className={`grid gap-4 ${cols}`}>
          {matches.map((m) => {
            const color = scoreColor(m.compatibilityScore)
            const diffCfg = DIFFICULTY_CONFIG[m.difficulty as BrandDifficulty]
            return (
              <div
                key={m.brandId}
                className="rounded-xl p-4 border border-studio-brd/60"
                style={{ background: '#1C1A17' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg border border-studio-brd flex items-center justify-center shrink-0"
                      style={{ background: '#141210' }}
                    >
                      <span className="font-serif font-bold text-xs text-white/60">{m.brandName[0]}</span>
                    </div>
                    <div className="font-sans text-[12px] font-medium text-white/80 truncate">{m.brandName}</div>
                  </div>
                  <button
                    onClick={() => onRemove(m.brandId)}
                    className="font-sans text-[11px] text-white/20 hover:text-white/50 transition-colors shrink-0"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: 'Compatibility', value: `${m.compatibilityScore}%`, color },
                    { label: 'Approval Rate', value: `${m.approvalRate}%`, color: '#22C55E' },
                    { label: 'Est. Earnings', value: formatEarnings(m.earningsMin, m.earningsMax), color: '#F5A653' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="font-sans text-[10px] text-white/30">{row.label}</span>
                      <span className="font-mono text-[11px] font-semibold" style={{ color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] text-white/30">Difficulty</span>
                    <span
                      className="font-mono text-[9px] px-2 py-0.5 rounded"
                      style={{ color: diffCfg.color, background: diffCfg.bg }}
                    >
                      {diffCfg.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {matches.length < 3 && (
          <p className="font-sans text-[11px] text-white/20 mt-3">
            Add {3 - matches.length} more brand{3 - matches.length > 1 ? 's' : ''} to compare — click ⧉ on any match card
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────

type Phase = 'input' | 'loading' | 'results'

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export default function CreatorMatchPage() {
  const { user } = useAuth()

  const [phase, setPhase] = useState<Phase>('input')
  const [profile, setProfile] = useState<CreatorProfile>({ niche: '', followers: 0, contentStyle: '', platform: '' })
  const [loadingStep, setLoadingStep] = useState(0)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [savedResult] = useState<MatchResult | null>(() => loadMatchResult())
  const [activeExplainId, setActiveExplainId] = useState<string | null>(null)
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set())

  const isFormValid =
    profile.niche !== '' &&
    profile.followers > 0 &&
    profile.contentStyle !== '' &&
    profile.platform !== ''

  function setField<K extends keyof CreatorProfile>(k: K, v: CreatorProfile[K]) {
    setProfile((p) => ({ ...p, [k]: v }))
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 3) next.add(id)
      return next
    })
  }

  function toggleExplain(id: string) {
    setActiveExplainId((prev) => (prev === id ? null : id))
  }

  async function runAnalysis() {
    if (!isFormValid) return
    setPhase('loading')
    setLoadingStep(0)
    setActiveExplainId(null)
    setCompareIds(new Set())
    setIsSaved(false)

    await delay(700); setLoadingStep(1)
    await delay(700); setLoadingStep(2)
    await delay(700); setLoadingStep(3)
    await delay(550)

    const result = runMatchAnalysis(profile)
    setMatchResult(result)
    setPhase('results')
  }

  function handleSave() {
    if (!matchResult) return
    saveMatchResult(matchResult)
    setIsSaved(true)
  }

  function handleReset() {
    setPhase('input')
    setMatchResult(null)
    setActiveExplainId(null)
    setCompareIds(new Set())
    setIsSaved(false)
  }

  function resumeSaved() {
    if (!savedResult) return
    setProfile(savedResult.profile)
    setMatchResult(savedResult)
    setPhase('results')
    setIsSaved(true)
  }

  const explainMatch = matchResult?.matches.find((m) => m.brandId === activeExplainId) ?? null
  const compareMatches = matchResult?.matches.filter((m) => compareIds.has(m.brandId)) ?? []

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      {/* Header — preserved exactly */}
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

      <AnimatePresence mode="wait">

        {/* ── INPUT ── */}
        {phase === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease }}
          >
            <div
              className="rounded-2xl overflow-hidden border border-studio-brd mb-6"
              style={{ background: '#0F0E0B' }}
            >
              {/* Profile header */}
              <div className="px-6 py-5 border-b border-studio-brd flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ember-400 to-ember-800 flex items-center justify-center text-white font-serif text-lg shrink-0">
                  {user?.name?.[0] ?? '?'}
                </div>
                <div>
                  <div className="font-sans text-[15px] font-semibold text-white">
                    @{user?.name ?? 'you'}
                  </div>
                  <div className="font-sans text-[11px] text-white/35 mt-0.5">
                    Fill in your profile to generate brand matches
                  </div>
                </div>
                <div className="ml-auto label-caps text-white/20">0 matches</div>
              </div>

              {/* Form fields */}
              <div className="p-5 border-b border-studio-brd/50">
                <div className="label-caps text-white/25 mb-4">Creator profile</div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Niche"
                    value={profile.niche}
                    onChange={(v) => setField('niche', v)}
                    options={NICHES}
                    placeholder="Select your niche…"
                  />
                  <div>
                    <label className="label-caps text-white/25 mb-2 block" style={{ fontSize: '9px' }}>
                      Followers
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={profile.followers || ''}
                      onChange={(e) => setField('followers', parseInt(e.target.value) || 0)}
                      placeholder="e.g. 50000"
                      className="w-full font-sans text-[13px] py-2.5 px-3 rounded-xl border border-studio-brd focus:outline-none"
                      style={{ background: '#141210', color: 'rgba(255,255,255,0.7)' }}
                    />
                    {profile.followers > 0 && (
                      <p className="font-sans text-[10px] text-white/25 mt-1 ml-1">
                        {getFollowerTierLabel(profile.followers)} · {formatFollowers(profile.followers)} followers
                      </p>
                    )}
                  </div>
                  <SelectField
                    label="Content Style"
                    value={profile.contentStyle}
                    onChange={(v) => setField('contentStyle', v)}
                    options={CONTENT_STYLES}
                    placeholder="Select content style…"
                  />
                  <SelectField
                    label="Primary Platform"
                    value={profile.platform}
                    onChange={(v) => setField('platform', v)}
                    options={PLATFORMS}
                    placeholder="Select platform…"
                  />
                </div>
              </div>

              {/* Analyze button */}
              <div className="p-5 flex items-center justify-between">
                <span className="font-sans text-[11px] text-white/20">
                  Matched against 102 analyzed brands
                </span>
                <button
                  onClick={runAnalysis}
                  disabled={!isFormValid}
                  className="font-sans text-[13px] font-semibold text-white rounded-xl px-6 py-2.5 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: isFormValid
                      ? 'linear-gradient(135deg, #D97C28 0%, #A8561A 100%)'
                      : 'rgba(255,255,255,0.08)',
                  }}
                >
                  Analyze Match →
                </button>
              </div>
            </div>

            {/* Resume saved result */}
            {savedResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1, ease }}
                className="rounded-xl px-4 py-3.5 border border-studio-brd mb-6 flex items-center justify-between"
                style={{ background: '#141210' }}
              >
                <div>
                  <div className="font-sans text-[12px] text-white/60 font-medium">
                    Previous analysis available
                  </div>
                  <div className="font-sans text-[11px] text-white/30 mt-0.5">
                    {savedResult.profile.niche} · {formatFollowers(savedResult.profile.followers)} followers · {savedResult.profile.platform} · {savedResult.matches.length} matches
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => clearMatchResult() || window.location.reload()}
                    className="font-sans text-[10px] text-white/20 hover:text-white/40 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={resumeSaved}
                    className="font-sans text-[11px] font-medium px-3 py-1.5 rounded-lg border border-studio-brd text-white/60 hover:text-white/90 hover:border-studio-ele transition-all"
                    style={{ background: '#1C1A17' }}
                  >
                    Resume →
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── LOADING ── */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-6"
          >
            <LoadingCard step={loadingStep} />
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && matchResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, delay: 0.05, ease }}
            className="rounded-2xl overflow-hidden border border-studio-brd mb-6"
            style={{ background: '#0F0E0B' }}
          >
            {/* Profile header — preserved structure, populated from form */}
            <div className="px-6 py-5 border-b border-studio-brd flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ember-400 to-ember-800 flex items-center justify-center text-white font-serif text-lg shrink-0">
                {user?.name?.[0] ?? '?'}
              </div>
              <div>
                <div className="font-sans text-[15px] font-semibold text-white">
                  @{user?.name ?? 'you'}
                </div>
                <div className="font-sans text-[11px] text-white/35 mt-0.5">
                  {matchResult.profile.niche} · {formatFollowers(matchResult.profile.followers)} followers · {matchResult.profile.platform}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <div className="label-caps text-ember-400/60">
                  {matchResult.matches.length} matches
                </div>
                <button
                  onClick={handleSave}
                  className="font-sans text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all duration-150"
                  style={{
                    background: isSaved ? 'rgba(34,197,94,0.08)' : '#141210',
                    color: isSaved ? '#4ADE80' : 'rgba(255,255,255,0.4)',
                    borderColor: isSaved ? 'rgba(34,197,94,0.2)' : 'rgba(42,39,34,1)',
                  }}
                >
                  {isSaved ? '✓ Saved' : '↓ Save results'}
                </button>
                <button
                  onClick={handleReset}
                  className="font-sans text-[11px] text-white/25 hover:text-white/55 transition-colors"
                >
                  New analysis
                </button>
              </div>
            </div>

            {/* Voice signature — preserved bar structure, computed values */}
            <div className="p-5 border-b border-studio-brd/50">
              <div className="label-caps text-white/25 mb-4">Voice signature</div>
              <div className="space-y-3">
                {matchResult.voiceSignature.map((t) => (
                  <div key={t.trait} className="flex items-center gap-3">
                    <span className="font-sans text-[12px] text-white/40 w-48 shrink-0">{t.trait}</span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: '#2A2722' }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${t.score}%` }}
                        transition={{ duration: 0.9, ease }}
                        style={{ background: '#F5A653', opacity: 0.7 }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-white/35 w-8 text-right">{t.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Matched brands — preserved grid structure, extended cards */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="label-caps text-white/25">Matched brands</div>
                {compareIds.size > 0 && (
                  <span className="font-sans text-[11px] text-white/30">
                    {compareIds.size} selected for comparison
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {matchResult.matches.map((m, i) => {
                  const color = scoreColor(m.compatibilityScore)
                  const label = scoreLabel(m.compatibilityScore)
                  const diffCfg = DIFFICULTY_CONFIG[m.difficulty as BrandDifficulty]
                  const isComparing = compareIds.has(m.brandId)
                  const isExplaining = activeExplainId === m.brandId

                  return (
                    <motion.div
                      key={m.brandId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease }}
                      className="rounded-xl p-4 border"
                      style={{
                        background: '#1C1A17',
                        borderColor: isExplaining
                          ? color + '50'
                          : isComparing
                          ? 'rgba(245,166,83,0.3)'
                          : 'rgba(42,39,34,0.6)',
                      }}
                    >
                      {/* Row 1: logo + ring — preserved exactly */}
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-8 h-8 rounded-lg border border-studio-brd flex items-center justify-center"
                          style={{ background: '#141210' }}
                        >
                          <span className="font-serif font-bold text-xs text-white/60">{m.brandName[0]}</span>
                        </div>
                        <MiniRing score={m.compatibilityScore} size={36} color={color} />
                      </div>

                      {/* Brand name — preserved exactly */}
                      <div className="font-sans text-[13px] font-medium text-white/80">{m.brandName}</div>

                      {/* Score label — preserved exactly */}
                      <div className="label-caps mt-1" style={{ color: color + 'aa', fontSize: 9 }}>
                        {label}
                      </div>

                      {/* New: approval + earnings row */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
                          {m.approvalRate}% approval
                        </span>
                        <span
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                          style={{ color: diffCfg.color, background: diffCfg.bg }}
                        >
                          {diffCfg.label}
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.20)' }}>
                        {formatEarnings(m.earningsMin, m.earningsMax)}
                      </div>

                      {/* New: action row */}
                      <div
                        className="mt-3 pt-2.5 border-t flex items-center justify-between"
                        style={{ borderColor: 'rgba(42,39,34,0.5)' }}
                      >
                        <button
                          onClick={() => toggleExplain(m.brandId)}
                          className="font-sans text-[10px] transition-colors"
                          style={{ color: isExplaining ? color : 'rgba(255,255,255,0.3)' }}
                        >
                          {isExplaining ? '▴ Why' : '▾ Why'}
                        </button>
                        <button
                          onClick={() => toggleCompare(m.brandId)}
                          className="font-sans text-[10px] px-2 py-0.5 rounded transition-all duration-150"
                          style={{
                            color: isComparing ? '#F5A653' : 'rgba(255,255,255,0.28)',
                            background: isComparing ? 'rgba(245,166,83,0.1)' : 'transparent',
                          }}
                        >
                          {isComparing ? '⊙ Set' : '⧉ Compare'}
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Match explain panel */}
              <AnimatePresence>
                {explainMatch && (
                  <MatchExplainPanel
                    key={explainMatch.brandId}
                    match={explainMatch}
                    onClose={() => setActiveExplainId(null)}
                  />
                )}
              </AnimatePresence>

              {/* Comparison panel */}
              <AnimatePresence>
                {compareIds.size >= 2 && (
                  <ComparePanel
                    key="compare"
                    matches={compareMatches}
                    onRemove={toggleCompare}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Feature cards — preserved exactly */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease }}
        className="grid md:grid-cols-3 gap-4"
      >
        {[
          { icon: '◈', title: 'Voice fingerprint',  desc: 'Analyzed across 200+ content signals from your existing work.' },
          { icon: '↗', title: 'Ranked matches',     desc: 'Sorted by predicted approval rate from 102 analyzed brands.' },
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
