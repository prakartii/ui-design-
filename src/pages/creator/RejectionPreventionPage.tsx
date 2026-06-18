import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  analyzeContent,
  loadHistory,
  saveToHistory,
  downloadTextReport,
  downloadJsonReport,
  getRiskColor,
  getRiskLabel,
  LEVEL_CONFIG,
  LOADING_STEPS,
  fixReduction,
  type ContentAnalysis,
  type ContentIssue,
  type ContentType,
  type IssueLevel,
} from '../../services/rejectionPreventionService'

const ease = [0.16, 1, 0.3, 1] as const

// ── Parsed line ───────────────────────────────────────────────

interface ParsedLine {
  key: string
  lineNum: number | null
  text: string
  issue: ContentIssue | undefined
}

function parseLines(content: string, issues: ContentIssue[]): ParsedLine[] {
  const raw = content.split('\n')
  let num = 0
  return raw.map((text, idx) => {
    const blank = text.trim() === ''
    if (!blank) num++
    const issue = blank
      ? undefined
      : issues.find((iss) => {
          const lower = text.toLowerCase()
          return (
            lower.includes(iss.highlightText.toLowerCase()) ||
            lower.includes(iss.lineContext.toLowerCase().slice(0, 40))
          )
        })
    return { key: `line-${idx}`, lineNum: blank ? null : num, text, issue }
  })
}

// ── Approval meter ────────────────────────────────────────────

function ApprovalMeter({
  riskScore,
  approvalProbability,
}: {
  riskScore: number
  approvalProbability: number
}) {
  const riskColor = getRiskColor(riskScore)
  return (
    <div className="rounded-xl p-5 border border-studio-brd" style={{ background: '#141210' }}>
      <div className="label-caps text-white/25 mb-5">Approval Forecast</div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-[11px] text-white/40">Risk Score</span>
          <span className="font-mono text-[13px] font-semibold" style={{ color: riskColor }}>
            {riskScore}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${riskScore}%` }}
            transition={{ duration: 1.0, ease }}
            style={{ background: riskColor }}
          />
        </div>
        <div className="mt-1 font-sans text-[10px]" style={{ color: riskColor + 'bb' }}>
          {getRiskLabel(riskScore)}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-[11px] text-white/40">Approval Probability</span>
          <span className="font-mono text-[13px] font-semibold text-emerald-400">
            {approvalProbability}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${approvalProbability}%` }}
            transition={{ duration: 1.0, delay: 0.1, ease }}
            style={{ background: '#22C55E' }}
          />
        </div>
        <div className="mt-1 font-sans text-[10px] text-emerald-400/60">
          {approvalProbability >= 70
            ? 'Strong approval likelihood'
            : approvalProbability >= 40
            ? 'Moderate approval chance'
            : 'Low approval likelihood'}
        </div>
      </div>
    </div>
  )
}

// ── Inline annotation (diff + apply) ─────────────────────────

function InlineAnnotation({
  issue,
  onApply,
}: {
  issue: ContentIssue
  onApply: () => void
}) {
  const cfg = LEVEL_CONFIG[issue.level]
  return (
    <div
      className="ml-12 mr-4 my-1 rounded-xl overflow-hidden"
      style={{ border: `1px solid ${cfg.border}`, background: 'rgba(12,11,9,0.85)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-start justify-between gap-4"
        style={{
          background: cfg.bg,
          borderBottom: `1px solid ${cfg.border}`,
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="font-mono text-xs font-medium"
              style={{ color: cfg.color, fontSize: '10px', letterSpacing: '0.06em' }}
            >
              {issue.id} · {cfg.label}
            </span>
          </div>
          <p className="font-sans text-sm font-medium" style={{ color: '#F0EDE8' }}>
            {issue.title}
          </p>
        </div>
        <span
          className="label-caps shrink-0 mt-0.5"
          style={{ fontSize: '9px', color: cfg.color + 'aa' }}
        >
          {issue.pattern}
        </span>
      </div>

      {/* Detail + diff */}
      <div className="px-5 py-4">
        <p
          className="font-sans text-xs leading-[1.75]"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {issue.detail}
        </p>

        <div
          className="mt-4 rounded-lg overflow-hidden font-mono text-xs"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="flex items-start gap-3 px-4 py-2.5"
            style={{
              background: 'rgba(239,68,68,0.08)',
              borderBottom: '1px solid rgba(239,68,68,0.12)',
            }}
          >
            <span style={{ color: '#F87171' }}>−</span>
            <span style={{ color: 'rgba(248,113,113,0.8)', lineHeight: 1.7 }}>
              {issue.original}
            </span>
          </div>
          <div
            className="flex items-start gap-3 px-4 py-2.5"
            style={{ background: 'rgba(34,197,94,0.06)' }}
          >
            <span style={{ color: '#4ADE80' }}>+</span>
            <span style={{ color: 'rgba(74,222,128,0.8)', lineHeight: 1.7 }}>
              {issue.improved}
            </span>
          </div>
        </div>

        <button
          onClick={onApply}
          className="w-full mt-3 font-sans text-xs font-medium py-2.5 rounded-lg transition-all duration-150 hover:opacity-90"
          style={{
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
          }}
        >
          Apply AI Fix →
        </button>
      </div>
    </div>
  )
}

// ── Content line viewer ───────────────────────────────────────

function ContentLineView({
  parsed,
  isActive,
  isApplied,
  onSelect,
  onApply,
}: {
  parsed: ParsedLine
  isActive: boolean
  isApplied: boolean
  onSelect: () => void
  onApply: () => void
}) {
  const { lineNum, text, issue } = parsed
  const cfg = issue ? LEVEL_CONFIG[issue.level] : null

  if (text.trim() === '') return <div className="h-3" />

  // Highlight the specific risky substring
  function renderText() {
    if (!issue || !cfg) {
      return <span style={{ color: 'rgba(240,237,232,0.55)' }}>{text}</span>
    }
    const lower = text.toLowerCase()
    const hlLower = issue.highlightText.toLowerCase()
    const idx = lower.indexOf(hlLower)
    if (idx === -1) {
      return <span style={{ color: 'rgba(240,237,232,0.75)' }}>{text}</span>
    }
    return (
      <>
        <span style={{ color: 'rgba(240,237,232,0.75)' }}>{text.slice(0, idx)}</span>
        <mark
          style={{
            background: cfg.color + '22',
            color: cfg.color,
            borderRadius: '2px',
            padding: '0 2px',
          }}
        >
          {text.slice(idx, idx + issue.highlightText.length)}
        </mark>
        <span style={{ color: 'rgba(240,237,232,0.75)' }}>
          {text.slice(idx + issue.highlightText.length)}
        </span>
      </>
    )
  }

  return (
    <div>
      <motion.div
        onClick={issue ? onSelect : undefined}
        animate={{
          backgroundColor:
            isApplied
              ? 'rgba(34,197,94,0.04)'
              : isActive && issue
              ? `rgba(${issue.level === 'critical' ? '239,68,68' : issue.level === 'high' ? '245,166,83' : '234,179,8'}, 0.05)`
              : 'transparent',
        }}
        transition={{ duration: 0.2 }}
        className="relative flex items-start"
        style={{ cursor: issue ? 'pointer' : 'default' }}
      >
        {/* Left border accent */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-[2.5px]"
          animate={{
            backgroundColor: isApplied
              ? '#22C55E'
              : issue
              ? isActive
                ? cfg!.color
                : cfg!.color + '55'
              : 'transparent',
          }}
          transition={{ duration: 0.25 }}
        />

        {/* Line number */}
        <div
          className="w-12 shrink-0 py-2 text-right pr-4 select-none font-mono text-[11px]"
          style={{ color: issue ? cfg!.color + '99' : 'rgba(255,255,255,0.15)' }}
        >
          {lineNum}
        </div>

        {/* Line text */}
        <div className="flex-1 py-2 pr-28 font-mono text-sm leading-[1.8]">
          {isApplied ? (
            <span style={{ color: '#4ADE80' }}>✓ {issue!.improved}</span>
          ) : (
            renderText()
          )}
        </div>

        {/* Right badge */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            {isApplied ? (
              <motion.span
                key="fixed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-[10px] px-2 py-0.5 rounded"
                style={{
                  background: 'rgba(34,197,94,0.12)',
                  color: '#4ADE80',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                Fixed
              </motion.span>
            ) : issue ? (
              <motion.span
                key="badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-[10px] px-2 py-0.5 rounded"
                style={{
                  background: cfg!.bg,
                  color: cfg!.color,
                  border: `1px solid ${cfg!.border}`,
                }}
              >
                {cfg!.label}
              </motion.span>
            ) : (
              <motion.span
                key="clean"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ color: '#22C55E', fontSize: '11px' }}
              >
                ✓
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Expandable annotation */}
      <AnimatePresence>
        {isActive && issue && !isApplied && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease }}
            className="overflow-hidden"
          >
            <InlineAnnotation issue={issue} onApply={onApply} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Issue item (right sidebar) ────────────────────────────────

function IssueItem({
  issue,
  isActive,
  isApplied,
  onSelect,
  onApply,
}: {
  issue: ContentIssue
  isActive: boolean
  isApplied: boolean
  onSelect: () => void
  onApply: () => void
}) {
  const cfg = LEVEL_CONFIG[issue.level]
  return (
    <motion.div
      layout
      onClick={!isApplied ? onSelect : undefined}
      className="rounded-xl overflow-hidden transition-all duration-150"
      style={{
        background: isApplied
          ? 'rgba(34,197,94,0.04)'
          : isActive
          ? 'rgba(255,255,255,0.04)'
          : 'transparent',
        border: `1px solid ${
          isApplied
            ? 'rgba(34,197,94,0.15)'
            : isActive
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(255,255,255,0.06)'
        }`,
        cursor: isApplied ? 'default' : 'pointer',
        opacity: isApplied ? 0.55 : 1,
      }}
    >
      <div className="px-4 py-3.5 flex items-start gap-3">
        <motion.div
          className="mt-1 w-2 h-2 rounded-full shrink-0"
          style={{ background: isApplied ? '#22C55E' : cfg.color }}
          animate={{ opacity: isActive && !isApplied ? [1, 0.35, 1] : 1 }}
          transition={{ duration: 1.1, repeat: isActive && !isApplied ? Infinity : 0 }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {issue.id}
            </span>
            <span
              className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={{ color: cfg.color, background: cfg.bg }}
            >
              {cfg.label}
            </span>
            {isApplied && (
              <span
                className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                style={{ color: '#4ADE80', background: 'rgba(34,197,94,0.1)' }}
              >
                Fixed
              </span>
            )}
          </div>
          <p
            className="font-sans text-sm leading-snug"
            style={{
              color: isApplied ? 'rgba(255,255,255,0.3)' : '#F0EDE8',
              textDecoration: isApplied ? 'line-through' : 'none',
            }}
          >
            {issue.title}
          </p>
          <p
            className="font-mono text-[10px] mt-1"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            {issue.pattern}
          </p>
        </div>

        {!isApplied && (
          <motion.span
            animate={{ x: isActive ? 2 : 0, opacity: isActive ? 1 : 0.3 }}
            className="font-sans text-xs mt-1 shrink-0"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            →
          </motion.span>
        )}
      </div>

      {/* Expanded apply area */}
      <AnimatePresence>
        {isActive && !isApplied && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              <div
                className="rounded-lg p-3 mb-3 font-mono text-[11px] leading-[1.75]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                {issue.detail}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onApply()
                }}
                className="w-full font-sans text-xs font-medium py-2.5 rounded-lg transition-all duration-150 hover:opacity-90"
                style={{
                  background: cfg.bg,
                  color: cfg.color,
                  border: `1px solid ${cfg.border}`,
                }}
              >
                Apply AI Fix →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Loading card ──────────────────────────────────────────────

function LoadingCard({ step }: { step: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease }}
      className="rounded-2xl overflow-hidden border border-studio-brd"
      style={{ background: '#0F0E0B' }}
    >
      <div className="px-5 py-3.5 border-b border-studio-brd flex items-center gap-3">
        <div
          className="w-6 h-6 rounded border flex items-center justify-center"
          style={{ background: 'rgba(245,166,83,0.1)', borderColor: 'rgba(245,166,83,0.2)' }}
        >
          <span style={{ color: '#F5A653', fontSize: '9px' }}>◈</span>
        </div>
        <span className="label-caps text-white/40">AI Review in Progress</span>
        <div className="ml-auto flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#F5A653' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.1, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>

      <div className="p-10">
        <div className="max-w-xs mx-auto">
          <div className="space-y-3 mb-8">
            {LOADING_STEPS.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: i <= step ? 1 : 0.2, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    background:
                      i < step
                        ? 'rgba(34,197,94,0.15)'
                        : i === step
                        ? 'rgba(245,166,83,0.1)'
                        : 'transparent',
                    borderColor:
                      i < step
                        ? 'rgba(34,197,94,0.35)'
                        : i === step
                        ? 'rgba(245,166,83,0.4)'
                        : 'rgba(255,255,255,0.1)',
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
                    color:
                      i < step
                        ? 'rgba(74,222,128,0.7)'
                        : i === step
                        ? 'rgba(255,255,255,0.75)'
                        : 'rgba(255,255,255,0.2)',
                  }}
                >
                  {msg}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="h-1 rounded-full overflow-hidden" style={{ background: '#2A2722' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: '#D97C28' }}
              animate={{ width: `${((step + 1) / LOADING_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Empty state ───────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease }}
      className="rounded-2xl border border-dashed border-studio-brd/50 flex flex-col items-center justify-center py-20 px-8 text-center"
      style={{ background: '#0F0E0B' }}
    >
      <div className="font-mono text-[36px] mb-4" style={{ color: 'rgba(255,255,255,0.06)' }}>◉</div>
      <div className="font-sans text-[14px] font-medium text-white/30 mb-2">
        Paste your content to begin
      </div>
      <div className="font-sans text-[12px] text-white/20 max-w-xs leading-relaxed">
        Scripts, captions, and video concepts are analyzed line by line for rejection triggers.
      </div>
    </motion.div>
  )
}

// ── Error card ────────────────────────────────────────────────

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease }}
      className="rounded-2xl overflow-hidden border border-red-900/40"
      style={{ background: '#0F0E0B' }}
    >
      <div
        className="px-5 py-3.5 border-b border-red-900/30 flex items-center gap-3"
      >
        <div
          className="w-6 h-6 rounded border flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' }}
        >
          <span style={{ color: '#EF4444', fontSize: '9px' }}>✗</span>
        </div>
        <span className="label-caps" style={{ color: 'rgba(239,68,68,0.6)' }}>Analysis Failed</span>
      </div>
      <div className="p-10 flex flex-col items-center text-center">
        <p
          className="font-sans text-[13px] leading-relaxed max-w-sm mb-6"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {message}
        </p>
        <button
          onClick={onRetry}
          className="rounded-xl px-5 py-2.5 font-sans text-[13px] font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #D97C28 0%, #A8561A 100%)' }}
        >
          Retry Analysis →
        </button>
      </div>
    </motion.div>
  )
}

// ── CopyFlash button ──────────────────────────────────────────

function FlashButton({
  onClick,
  label,
  flashLabel = '✓ Done',
}: {
  onClick: () => void
  label: string
  flashLabel?: string
}) {
  const [flash, setFlash] = useState(false)
  function handle() {
    onClick()
    setFlash(true)
    setTimeout(() => setFlash(false), 1600)
  }
  return (
    <button
      onClick={handle}
      className="font-sans text-[11px] font-medium px-3 py-1.5 rounded-lg border border-studio-brd text-white/40 hover:text-white/70 hover:border-studio-ele transition-all duration-150"
      style={{ background: '#141210' }}
    >
      {flash ? flashLabel : label}
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────

type Phase = 'input' | 'loading' | 'results'

export default function RejectionPreventionPage() {
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState<ContentType>('script')
  const [phase, setPhase] = useState<Phase>('input')
  const [loadingStep, setLoadingStep] = useState(0)
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null)
  const [riskScore, setRiskScore] = useState(0)
  const [history, setHistory] = useState<ContentAnalysis[]>(() => loadHistory())
  const [showHistory, setShowHistory] = useState(false)
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [filterLevel, setFilterLevel] = useState<'all' | IssueLevel>('all')
  const [error, setError] = useState<string | null>(null)

  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const contentViewRef = useRef<HTMLDivElement>(null)

  const canAnalyze = content.trim().length > 10

  // Derived
  const parsedLines = analysis
    ? parseLines(analysis.content, analysis.issues)
    : []

  const openCount = analysis
    ? analysis.issues.filter((i) => !appliedIds.has(i.id)).length
    : 0

  const filteredIssues = analysis
    ? analysis.issues.filter((i) =>
        filterLevel === 'all' ? true : i.level === filterLevel,
      )
    : []

  const criticalCount = analysis?.issues.filter((i) => i.level === 'critical').length ?? 0
  const highCount = analysis?.issues.filter((i) => i.level === 'high').length ?? 0
  const mediumCount = analysis?.issues.filter((i) => i.level === 'medium').length ?? 0

  // Scroll to issue line in content viewer
  const scrollToIssue = useCallback(
    (issueId: string) => {
      if (!analysis || !contentViewRef.current) return
      const issue = analysis.issues.find((i) => i.id === issueId)
      if (!issue) return
      const el = contentViewRef.current.querySelector(
        `[data-issueid="${issue.id}"]`,
      ) as HTMLElement | null
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },
    [analysis],
  )

  const handleSelectIssue = useCallback(
    (id: string) => {
      setActiveIssueId((prev) => (prev === id ? null : id))
      scrollToIssue(id)
    },
    [scrollToIssue],
  )

  const handleApply = useCallback(
    (issueId: string) => {
      const issue = analysis?.issues.find((i) => i.id === issueId)
      if (!issue || appliedIds.has(issueId)) return
      setAppliedIds((prev) => new Set([...prev, issueId]))
      setActiveIssueId(null)
      setRiskScore((prev) => Math.max(0, prev - fixReduction(issue.level)))
    },
    [analysis, appliedIds],
  )

  const handleApplyAll = useCallback(() => {
    if (!analysis) return
    const newApplied = new Set(appliedIds)
    let reduction = 0
    analysis.issues.forEach((issue) => {
      if (!newApplied.has(issue.id)) {
        newApplied.add(issue.id)
        reduction += fixReduction(issue.level)
      }
    })
    setAppliedIds(newApplied)
    setActiveIssueId(null)
    setRiskScore((prev) => Math.max(0, prev - reduction))
  }, [analysis, appliedIds])

  const handleReset = useCallback(() => {
    setPhase('input')
    setAnalysis(null)
    setRiskScore(0)
    setAppliedIds(new Set())
    setActiveIssueId(null)
    setError(null)
    setFilterLevel('all')
  }, [])

  const openFromHistory = useCallback((a: ContentAnalysis) => {
    setAnalysis(a)
    setContent(a.content)
    setContentType(a.contentType)
    setRiskScore(a.riskScore)
    setAppliedIds(new Set())
    setActiveIssueId(null)
    setPhase('results')
    setShowHistory(false)
    setError(null)
    setFilterLevel('all')
  }, [])

  async function runAnalysis() {
    if (!canAnalyze || phase === 'loading') return
    setPhase('loading')
    setLoadingStep(0)
    setError(null)
    setAppliedIds(new Set())
    setActiveIssueId(null)

    let step = 0
    stepIntervalRef.current = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1)
      setLoadingStep(step)
    }, 1300)

    try {
      const result = await analyzeContent(content, contentType)
      const updated = saveToHistory(result)
      setHistory(updated)
      setAnalysis(result)
      setRiskScore(result.riskScore)
      setPhase('results')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Analysis failed. Please try again.',
      )
      setPhase('input')
    } finally {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current)
    }
  }, [])

  const inputClass =
    'w-full px-0 py-0 font-mono text-[13px] bg-transparent border-none focus:outline-none resize-none'

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">04 — Rejection Prevention Studio</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          Your script, reviewed before you submit it.
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2 max-w-md">
          Intent flags weak hooks, banned words, tone mismatches, and known rejection patterns —
          line by line, before you invest time in production.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* ── Left panel ── */}
        <div>
          <AnimatePresence mode="wait">
            {/* INPUT phase */}
            {phase === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease }}
                className="rounded-2xl overflow-hidden border border-studio-brd"
                style={{ background: '#0F0E0B' }}
              >
                {/* Content type tabs */}
                <div className="px-5 py-3.5 border-b border-studio-brd flex items-center justify-between">
                  <div className="flex gap-1">
                    {(['script', 'caption', 'concept'] as ContentType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setContentType(type)}
                        className="font-sans text-[11px] font-medium px-3 py-1.5 rounded-md capitalize transition-all duration-150"
                        style={{
                          background:
                            contentType === type
                              ? 'rgba(245,166,83,0.12)'
                              : 'transparent',
                          color:
                            contentType === type
                              ? '#F5A653'
                              : 'rgba(255,255,255,0.3)',
                          border:
                            contentType === type
                              ? '1px solid rgba(245,166,83,0.2)'
                              : '1px solid transparent',
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {content.length} chars
                  </span>
                </div>

                {/* Textarea */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    contentType === 'script'
                      ? 'Paste your script here — line by line if possible…'
                      : contentType === 'caption'
                      ? 'Paste your caption text here…'
                      : 'Describe your video concept, structure, and key moments…'
                  }
                  rows={16}
                  className={inputClass}
                  style={{
                    color: 'rgba(255,255,255,0.65)',
                    padding: '20px',
                    lineHeight: '1.9',
                  }}
                />

                {/* Footer */}
                <div className="px-5 py-4 border-t border-studio-brd flex items-center justify-between">
                  {error && (
                    <p className="font-sans text-[11px]" style={{ color: '#F87171' }}>
                      {error}
                    </p>
                  )}
                  {!error && (
                    <span className="font-sans text-[11px] text-white/20">
                      {contentType === 'script'
                        ? 'One line per sentence works best'
                        : 'Paste any length of content'}
                    </span>
                  )}
                  <button
                    onClick={runAnalysis}
                    disabled={!canAnalyze}
                    className="font-sans text-[13px] font-semibold text-white rounded-xl px-5 py-2.5 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: canAnalyze
                        ? 'linear-gradient(135deg, #D97C28 0%, #A8561A 100%)'
                        : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    Analyze Content →
                  </button>
                </div>
              </motion.div>
            )}

            {/* LOADING phase */}
            {phase === 'loading' && (
              <LoadingCard key="loading" step={loadingStep} />
            )}

            {/* RESULTS phase */}
            {phase === 'results' && analysis && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease }}
                className="rounded-2xl overflow-hidden border border-studio-brd"
                style={{ background: '#141210' }}
              >
                {/* File tab bar */}
                <div
                  className="px-4 pt-3 pb-0 flex items-center"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="flex items-center gap-2 px-3 pb-2.5"
                    style={{ borderBottom: '2px solid #F5A653' }}
                  >
                    <span className="font-mono text-[11px]" style={{ color: '#F5A653' }}>
                      {analysis.contentType}.txt
                    </span>
                    <span
                      className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                      style={{
                        color: openCount > 0 ? '#EF4444' : '#4ADE80',
                        background:
                          openCount > 0
                            ? 'rgba(239,68,68,0.12)'
                            : 'rgba(34,197,94,0.12)',
                      }}
                    >
                      {openCount > 0 ? `${openCount} open` : 'All fixed'}
                    </span>
                  </div>
                </div>

                {/* Content lines */}
                <div ref={contentViewRef} className="py-3 max-h-[520px] overflow-y-auto">
                  {parsedLines.map((parsed) => (
                    <div
                      key={parsed.key}
                      data-issueid={parsed.issue?.id}
                    >
                      <ContentLineView
                        parsed={parsed}
                        isActive={activeIssueId === parsed.issue?.id}
                        isApplied={parsed.issue ? appliedIds.has(parsed.issue.id) : false}
                        onSelect={() =>
                          parsed.issue && handleSelectIssue(parsed.issue.id)
                        }
                        onApply={() =>
                          parsed.issue && handleApply(parsed.issue.id)
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* Pattern insight */}
                {analysis.patternInsight && (
                  <div
                    className="mx-4 mb-3 rounded-xl px-4 py-3.5 border"
                    style={{
                      background: 'rgba(139,75,16,0.1)',
                      borderColor: 'rgba(245,166,83,0.15)',
                      borderLeft: '2px solid rgba(245,166,83,0.4)',
                    }}
                  >
                    <div className="label-caps mb-1.5" style={{ fontSize: '9px', color: 'rgba(245,166,83,0.55)' }}>
                      Pattern Insight
                    </div>
                    <p
                      className="font-sans text-[12px] leading-relaxed italic"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                      "{analysis.patternInsight}"
                    </p>
                  </div>
                )}

                {/* Footer controls */}
                <div
                  className="px-5 py-4 border-t flex items-center justify-between"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: getRiskColor(riskScore) }}
                    >
                      <span
                        className="font-sans font-semibold text-[11px]"
                        style={{ color: getRiskColor(riskScore) }}
                      >
                        {riskScore}
                      </span>
                    </div>
                    <div>
                      <div
                        className="font-sans text-[10px] font-semibold"
                        style={{ color: getRiskColor(riskScore) }}
                      >
                        {getRiskLabel(riskScore)}
                      </div>
                      <div className="font-sans text-[10px] text-white/25">
                        {appliedIds.size > 0
                          ? `${appliedIds.size} fix${appliedIds.size > 1 ? 'es' : ''} applied`
                          : `${analysis.issues.length} issue${analysis.issues.length !== 1 ? 's' : ''} detected`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {openCount > 0 && (
                      <button
                        onClick={handleApplyAll}
                        className="font-sans text-[11px] font-medium px-3 py-1.5 rounded-md transition-all duration-150 hover:opacity-90"
                        style={{
                          background: 'rgba(34,197,94,0.1)',
                          color: '#4ADE80',
                          border: '1px solid rgba(34,197,94,0.2)',
                        }}
                      >
                        Apply all fixes →
                      </button>
                    )}
                    <button
                      onClick={handleReset}
                      className="font-sans text-[11px] text-white/30 hover:text-white/60 transition-colors"
                    >
                      New analysis
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right sidebar ── */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="space-y-4"
        >
          {/* RESULTS: Approval meter */}
          <AnimatePresence>
            {phase === 'results' && analysis && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
              >
                <ApprovalMeter
                  riskScore={riskScore}
                  approvalProbability={Math.max(
                    0,
                    analysis.approvalProbability + (analysis.riskScore - riskScore),
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* RESULTS: Issue count summary */}
          <AnimatePresence>
            {phase === 'results' && analysis && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.05, ease }}
                className="rounded-xl p-4 border border-studio-brd flex items-center justify-around"
                style={{ background: '#141210' }}
              >
                {[
                  { label: 'Critical', count: criticalCount, color: '#EF4444', level: 'critical' as IssueLevel },
                  { label: 'High', count: highCount, color: '#F5A653', level: 'high' as IssueLevel },
                  { label: 'Medium', count: mediumCount, color: '#EAB308', level: 'medium' as IssueLevel },
                ].map(({ label, count, color }) => (
                  <div key={label} className="text-center">
                    <div className="font-mono text-[20px] font-semibold" style={{ color }}>
                      {count}
                    </div>
                    <div className="font-sans text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* RESULTS: Issues panel */}
          <AnimatePresence>
            {phase === 'results' && analysis && analysis.issues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease }}
                className="rounded-xl overflow-hidden border border-studio-brd"
                style={{ background: '#141210' }}
              >
                {/* Panel header */}
                <div
                  className="px-4 pt-4 pb-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="label-caps" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                      Rejection Risks
                    </span>
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: getRiskColor(riskScore) }}
                    >
                      {openCount} open
                    </span>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1">
                    {(['all', 'critical', 'high', 'medium'] as const).map((level) => {
                      const count =
                        level === 'all'
                          ? analysis.issues.length
                          : analysis.issues.filter((i) => i.level === level).length
                      const isActive = filterLevel === level
                      const color =
                        level === 'all'
                          ? '#F0EDE8'
                          : LEVEL_CONFIG[level as IssueLevel].color
                      return (
                        <button
                          key={level}
                          onClick={() => setFilterLevel(level)}
                          className="font-sans text-[11px] px-2.5 py-1 rounded-md transition-all duration-150 capitalize"
                          style={{
                            background: isActive
                              ? 'rgba(255,255,255,0.08)'
                              : 'transparent',
                            color: isActive
                              ? color
                              : 'rgba(255,255,255,0.3)',
                          }}
                        >
                          {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}{' '}
                          <span style={{ opacity: 0.5 }}>({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Issue list */}
                <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto">
                  <AnimatePresence>
                    {filteredIssues.map((issue, i) => (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.3, delay: i * 0.04, ease }}
                      >
                        <IssueItem
                          issue={issue}
                          isActive={activeIssueId === issue.id}
                          isApplied={appliedIds.has(issue.id)}
                          onSelect={() => handleSelectIssue(issue.id)}
                          onApply={() => handleApply(issue.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Apply all */}
                {openCount > 0 && (
                  <div
                    className="px-4 pb-4 pt-1"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <button
                      onClick={handleApplyAll}
                      className="w-full font-sans text-[11px] font-medium py-2.5 rounded-lg transition-all duration-150 hover:opacity-90"
                      style={{
                        background: 'rgba(34,197,94,0.08)',
                        color: '#4ADE80',
                        border: '1px solid rgba(34,197,94,0.15)',
                      }}
                    >
                      Apply all AI fixes →
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* RESULTS: Download */}
          <AnimatePresence>
            {phase === 'results' && analysis && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.15, ease }}
                className="rounded-xl p-4 border border-studio-brd"
                style={{ background: '#141210' }}
              >
                <div className="label-caps text-white/25 mb-3">Export Report</div>
                <div className="flex gap-2">
                  <FlashButton
                    onClick={() => downloadTextReport(analysis)}
                    label="Download .txt"
                    flashLabel="✓ Saved"
                  />
                  <FlashButton
                    onClick={() => downloadJsonReport(analysis)}
                    label="Download .json"
                    flashLabel="✓ Saved"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Risk legend (always visible in input phase) */}
          {phase === 'input' && (
            <div
              className="rounded-xl p-5 border border-studio-brd"
              style={{ background: '#141210' }}
            >
              <div className="label-caps text-white/25 mb-4">Risk Levels</div>
              <div className="space-y-3">
                {[
                  { color: '#EF4444', label: 'Critical', desc: 'Immediate rejection triggers' },
                  { color: '#F5A653', label: 'High risk', desc: 'Known brand friction patterns' },
                  { color: '#EAB308', label: 'Medium', desc: 'Suboptimal but recoverable' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="font-sans text-[12px] font-medium text-white/60">
                      {item.label}
                    </span>
                    <span className="font-sans text-[11px] text-white/25">— {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="w-full flex items-center justify-between rounded-xl p-3 border border-studio-brd/50 transition-colors duration-150 hover:border-studio-ele"
                style={{ background: '#141210' }}
              >
                <span className="label-caps text-white/25">Recent Analyses</span>
                <span className="font-sans text-[10px] text-white/20">
                  {showHistory ? '↑ hide' : `${history.length} →`}
                </span>
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-1.5">
                      {history.map((h) => (
                        <button
                          key={h.id}
                          onClick={() => openFromHistory(h)}
                          className="w-full text-left flex items-center justify-between rounded-xl px-4 py-3 border border-studio-brd/40 hover:border-studio-ele transition-all duration-150 group"
                          style={{ background: '#141210' }}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className="font-mono text-[9px] px-1.5 py-0.5 rounded capitalize"
                                style={{
                                  background: 'rgba(245,166,83,0.08)',
                                  color: 'rgba(245,166,83,0.6)',
                                  border: '1px solid rgba(245,166,83,0.15)',
                                }}
                              >
                                {h.contentType}
                              </span>
                              <span
                                className="font-sans text-[10px]"
                                style={{ color: 'rgba(255,255,255,0.2)' }}
                              >
                                {new Date(h.analyzedAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                            <div
                              className="font-sans text-[11px] text-white/50 group-hover:text-white/70 transition-colors truncate"
                            >
                              {h.contentSnippet}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div
                              className="font-mono text-[13px] font-semibold"
                              style={{ color: getRiskColor(h.riskScore) }}
                            >
                              {h.riskScore}
                            </div>
                            <div
                              className="font-sans text-[9px]"
                              style={{ color: 'rgba(255,255,255,0.2)' }}
                            >
                              risk
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Empty input prompt */}
          {phase === 'input' && !error && (
            <div
              className="rounded-xl p-5 border border-dashed border-studio-brd/50 text-center"
            >
              <div className="font-mono text-2xl text-white/10 mb-3">⬡</div>
              <div className="font-sans text-[12px] font-medium text-white/40 mb-1">
                Analyze your content
              </div>
              <div className="font-sans text-[11px] text-white/20 leading-relaxed">
                Paste a script, caption, or concept above, then click Analyze Content.
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Loading: empty state placeholder in right sidebar */}
      {phase === 'loading' && (
        <div className="hidden lg:block" />
      )}
    </div>
  )
}
