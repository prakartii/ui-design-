import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

type RiskLevel = 'critical' | 'high' | 'medium'
type ScanPhase = 'idle' | 'scanning' | 'complete'

interface ScriptLine {
  id: string
  num: number | null
  text: string
  type: 'header' | 'meta' | 'timestamp' | 'content' | 'blank'
  issueId?: string
  highlight?: string
}

interface Issue {
  id: string
  lineId: string
  lineNum: number
  level: RiskLevel
  title: string
  pattern: string
  detail: string
  original: string
  improved: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SCRIPT_LINES: ScriptLine[] = [
  { id: 'h1', num: null, text: 'CREATOR SCRIPT — NIKE CAMPAIGN', type: 'header' },
  { id: 'h2', num: null, text: 'Format: 60s Vertical Video  ·  Creator: @sarah_runs  ·  Status: Under Review', type: 'meta' },
  { id: 'b1', num: null, text: '', type: 'blank' },
  { id: 'ts1', num: null, text: '[OPENING  ·  0:00–0:10]', type: 'timestamp' },
  { id: 'L5', num: 5, text: '"Hey everyone! I\'m SO excited to finally share these with you.', type: 'content', issueId: 'R001', highlight: "Hey everyone! I'm SO excited" },
  { id: 'b2', num: null, text: '', type: 'blank' },
  { id: 'ts2', num: null, text: '[PRODUCT INTRO  ·  0:10–0:25]', type: 'timestamp' },
  { id: 'L8', num: 8, text: "These Nike shoes are honestly the most comfortable I've ever worn.", type: 'content', issueId: 'R002', highlight: 'most comfortable' },
  { id: 'L9', num: 9, text: 'Perfect for everyday use — gym, errands, literally anything.', type: 'content' },
  { id: 'b3', num: null, text: '', type: 'blank' },
  { id: 'ts3', num: null, text: '[PRICE MOMENT  ·  0:25–0:35]', type: 'timestamp' },
  { id: 'L11', num: 11, text: 'I got them for just $120 at Nike.com — incredible value.', type: 'content', issueId: 'R003', highlight: '$120' },
  { id: 'L12', num: 12, text: "Use my code SARAH15 for 15% off your first order!", type: 'content', issueId: 'R003', highlight: 'SARAH15 for 15% off' },
  { id: 'b4', num: null, text: '', type: 'blank' },
  { id: 'ts4', num: null, text: '[LIFESTYLE  ·  0:35–0:50]', type: 'timestamp' },
  { id: 'L15', num: 15, text: "I've been wearing them nonstop — even just sitting at home watching TV.", type: 'content', issueId: 'R004', highlight: 'sitting at home watching TV' },
  { id: 'L16', num: 16, text: "They're SO easy and go with literally everything in my closet.", type: 'content', issueId: 'R005', highlight: 'SO easy' },
  { id: 'b5', num: null, text: '', type: 'blank' },
  { id: 'ts5', num: null, text: '[OUTRO  ·  0:50–1:00]', type: 'timestamp' },
  { id: 'L19', num: 19, text: "Honestly the most comfortable everyday shoe I've found in years.", type: 'content', issueId: 'R006', highlight: 'most comfortable everyday shoe' },
  { id: 'L20', num: 20, text: 'Super easy to buy — just link in bio! Nike really nailed comfort here."', type: 'content', issueId: 'R007', highlight: 'Super easy to buy' },
]

const ISSUES: Issue[] = [
  {
    id: 'R001',
    lineId: 'L5',
    lineNum: 5,
    level: 'high',
    title: 'Scripted opening — no motion',
    pattern: 'Opening Pattern',
    detail: 'Nike requires creators to be mid-activity in the first 3 seconds. A greeting and excitement statement signals a scripted, product-ad feel that Nike rejects consistently.',
    original: '"Hey everyone! I\'m SO excited to finally share these with you.',
    improved: '[0:00] Already mid-run. Heavy breathing. Not visible yet — just feet on pavement. No words.',
  },
  {
    id: 'R002',
    lineId: 'L8',
    lineNum: 8,
    level: 'critical',
    title: 'Comfort language — 100% rejection',
    pattern: 'Hard Limit',
    detail: 'Nike has rejected 100% of submissions containing the word "comfortable" in any form. Comfort is the enemy — Nike sells overcoming, not ease. This is a non-negotiable hard limit.',
    original: "These Nike shoes are honestly the most comfortable I've ever worn.",
    improved: 'Still locked in after kilometre 18. Back of the heel — zero slip. That\'s the story.',
  },
  {
    id: 'R003',
    lineId: 'L11',
    lineNum: 11,
    level: 'critical',
    title: 'Price + discount mention',
    pattern: 'Hard Limit',
    detail: 'Nike has a 100% rejection rate for any content mentioning price, discount codes, or percentage-off language. This is the single most common reason for submission rejection across all creators reviewed.',
    original: 'I got them for just $120 at Nike.com — use code SARAH15 for 15% off!',
    improved: '[Remove entirely. Never reference price, codes, or discounts. CTA: "link in bio" only, never in video.]',
  },
  {
    id: 'R004',
    lineId: 'L15',
    lineNum: 15,
    level: 'high',
    title: 'Resting / static frame',
    pattern: 'Opening & Closing Pattern',
    detail: 'Nike has rejected 100% of content that opens or closes on a resting state. Sitting at home watching TV is the antithesis of the brand. Even b-roll must be kinetic.',
    original: "I've been wearing them nonstop — even just sitting at home watching TV.",
    improved: "Morning 5am. Still dark. Already 6km in — they haven't shifted once.",
  },
  {
    id: 'R005',
    lineId: 'L16',
    lineNum: 16,
    level: 'high',
    title: '"Easy" — forbidden language',
    pattern: 'Hard Limit',
    detail: 'The word "easy" signals comfort and accessibility — the opposite of what Nike approves. Nike\'s creators choose the harder path. Ease language is rejected at the same rate as comfort language.',
    original: "They're SO easy and go with literally everything in my closet.",
    improved: "The design disappears into the work. You stop noticing them — which means they're doing their job.",
  },
  {
    id: 'R006',
    lineId: 'L19',
    lineNum: 19,
    level: 'critical',
    title: 'Critical comfort repeat in outro',
    pattern: 'Hard Limit',
    detail: "Using comfort language again in the outro compounds the first violation. This is the closing frame — Nike requires this to show forward motion, not comfort or settlement.",
    original: "Honestly the most comfortable everyday shoe I've found in years.",
    improved: "3 weeks in. I don't think about them anymore. That's when you know.",
  },
  {
    id: 'R007',
    lineId: 'L20',
    lineNum: 20,
    level: 'medium',
    title: 'Wrong closing frame + ease language',
    pattern: 'Closing Pattern',
    detail: 'The final frame should show you starting the next challenge — never finishing, never buying, never resting. "Super easy to buy" and "link in bio" in the video script itself are wrong formats.',
    original: 'Super easy to buy — just link in bio! Nike really nailed comfort here."',
    improved: '[End frame: shoes hitting pavement again. No words. Cut to black.]',
  },
]

const AI_RECS = [
  {
    id: 'ai1',
    issueIds: ['R001'],
    title: 'Rewrite the opening',
    instruction: 'Start mid-run. No greeting, no eye contact with camera, no intro. The first frame should be your shoes already moving — ideally from behind, going uphill. Physical struggle must be visible within 3 seconds.',
    example: '[0:00-0:03] Running uphill. Back of shoes visible. Heavy breathing on audio. No words.',
  },
  {
    id: 'ai2',
    issueIds: ['R002', 'R005', 'R006'],
    title: 'Replace all comfort + ease language',
    instruction: 'Every instance of "comfortable," "easy," or similar language must be replaced with proof of performance under real conditions. The metric should be distance, time, or physical challenge — never subjective comfort.',
    example: '"Still locked in after kilometre 18." / "No adjustment. Not once." / "Third day in a row."',
  },
  {
    id: 'ai3',
    issueIds: ['R003'],
    title: 'Remove the price moment entirely',
    instruction: 'Delete lines 11–12 in full. Replace with an achievement moment — show the product at the point of completing something hard. Nike\'s CTA pattern: the video never mentions where to buy. That lives only in comments/bio.',
    example: '[0:25-0:35] Product visible at finish line. Creator crosses. No words needed.',
  },
  {
    id: 'ai4',
    issueIds: ['R004', 'R007'],
    title: 'Rebuild the closing frame',
    instruction: 'The outro must end on a beginning, not an ending. Show yourself starting the next rep, the next km, the next challenge. Nike\'s approved closing pattern: forward motion always implied beyond the frame.',
    example: '[0:55] Tying laces. Not finishing a run — starting one. Cut before you stand.',
  },
]

const RISK_SCORE_INITIAL = 78

// ─── Utilities ────────────────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1] as const

const LEVEL_CONFIG = {
  critical: { label: 'Critical', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', dot: '#EF4444' },
  high: { label: 'High', color: '#F5A653', bg: 'rgba(245,166,83,0.1)', border: 'rgba(245,166,83,0.25)', dot: '#F5A653' },
  medium: { label: 'Medium', color: '#EAB308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.25)', dot: '#EAB308' },
}

function getRiskLabel(score: number) {
  if (score >= 70) return 'Very High Risk'
  if (score >= 50) return 'High Risk'
  if (score >= 30) return 'Medium Risk'
  return 'Low Risk'
}

function getRiskColor(score: number) {
  if (score >= 70) return '#EF4444'
  if (score >= 50) return '#F5A653'
  if (score >= 30) return '#EAB308'
  return '#22C55E'
}

// ─── Risk Gauge ───────────────────────────────────────────────────────────────

function RiskGauge({ score, animated }: { score: number; animated: boolean }) {
  const r = 20
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - score / 100)
  const color = getRiskColor(score)

  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <motion.circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={animated ? { strokeDashoffset: dashOffset } : { strokeDashoffset: circumference }}
        transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '28px 28px' }}
      />
      <text x="28" y="25" textAnchor="middle" style={{ fontSize: '11px', fontFamily: '"Playfair Display", serif', fontWeight: 300, fill: '#F0EDE8' }}>
        {score}
      </text>
      <text x="28" y="35" textAnchor="middle" style={{ fontSize: '6px', fontFamily: 'Inter', fill: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        RISK
      </text>
    </svg>
  )
}

// ─── Script Line ──────────────────────────────────────────────────────────────

function ScriptLineView({
  line,
  issue,
  isActive,
  isScanned,
  isApplied,
  onSelect,
}: {
  line: ScriptLine
  issue?: Issue
  isActive: boolean
  isScanned: boolean
  isApplied: boolean
  onSelect: () => void
}) {
  const cfg = issue ? LEVEL_CONFIG[issue.level] : null
  const showAnnotation = isActive && issue && !isApplied
  const hasIssue = !!issue && isScanned

  if (line.type === 'blank') return <div className="h-3" />

  if (line.type === 'header') {
    return (
      <div className="px-6 pt-5 pb-1">
        <span className="font-mono text-xs font-medium tracking-wider" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em' }}>
          {line.text}
        </span>
      </div>
    )
  }

  if (line.type === 'meta') {
    return (
      <div className="px-6 pb-4">
        <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>{line.text}</span>
      </div>
    )
  }

  if (line.type === 'timestamp') {
    return (
      <div className="px-6 pt-4 pb-1 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>{line.text}</span>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>
    )
  }

  // Content line
  const textContent = isApplied && issue
    ? `✓ [Fixed] ${issue.improved}`
    : line.text

  return (
    <div>
      <motion.div
        onClick={hasIssue ? onSelect : undefined}
        animate={{
          backgroundColor: isActive && hasIssue
            ? `rgba(${issue!.level === 'critical' ? '239,68,68' : issue!.level === 'high' ? '245,166,83' : '234,179,8'}, 0.05)`
            : isApplied
            ? 'rgba(34,197,94,0.04)'
            : 'transparent',
        }}
        transition={{ duration: 0.2 }}
        className="group flex items-start gap-0 relative"
        style={{ cursor: hasIssue ? 'pointer' : 'default' }}
      >
        {/* Left border accent */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-[2.5px]"
          animate={{
            backgroundColor: isApplied
              ? '#22C55E'
              : hasIssue
              ? (isActive ? cfg!.color : `${cfg!.color}66`)
              : 'transparent',
            opacity: hasIssue || isApplied ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Line number */}
        <div
          className="w-12 shrink-0 pt-2.5 pb-2 text-right pr-4 pl-2 select-none"
          style={{ color: hasIssue ? cfg!.color + '99' : 'rgba(255,255,255,0.15)', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}
        >
          {line.num}
        </div>

        {/* Text */}
        <div className="flex-1 pt-2 pb-2 pr-10">
          <motion.span
            className="font-mono text-sm leading-[1.8] block"
            animate={{
              color: isApplied
                ? '#4ADE80'
                : hasIssue
                ? '#F0EDE8'
                : 'rgba(240,237,232,0.55)',
            }}
            transition={{ duration: 0.3 }}
          >
            {textContent}
          </motion.span>
        </div>

        {/* Risk badge (right) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <AnimatePresence>
            {isApplied && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
              >
                <span style={{ color: '#4ADE80', fontSize: '10px' }}>✓</span>
              </motion.div>
            )}
            {!isApplied && hasIssue && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
                style={{ background: cfg!.bg, border: `1px solid ${cfg!.border}` }}
              >
                <div className="w-1 h-1 rounded-full" style={{ background: cfg!.color }} />
                <span className="font-mono text-xs" style={{ color: cfg!.color, fontSize: '10px' }}>{cfg!.label}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Inline annotation */}
      <AnimatePresence>
        {showAnnotation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <InlineAnnotation issue={issue!} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Inline Annotation ────────────────────────────────────────────────────────

function InlineAnnotation({ issue }: { issue: Issue }) {
  return (
    <div
      className="ml-12 mr-4 my-1 rounded-xl overflow-hidden"
      style={{ border: `1px solid ${LEVEL_CONFIG[issue.level].border}`, background: 'rgba(12,11,9,0.8)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-start justify-between gap-4"
        style={{ background: LEVEL_CONFIG[issue.level].bg, borderBottom: `1px solid ${LEVEL_CONFIG[issue.level].border}` }}
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-xs font-medium" style={{ color: LEVEL_CONFIG[issue.level].color, fontSize: '10px', letterSpacing: '0.06em' }}>
              {issue.id} · {LEVEL_CONFIG[issue.level].label}
            </span>
          </div>
          <p className="font-sans text-sm font-medium" style={{ color: '#F0EDE8' }}>{issue.title}</p>
        </div>
        <span className="label-caps shrink-0 mt-0.5" style={{ fontSize: '9px', color: LEVEL_CONFIG[issue.level].color + 'aa' }}>
          {issue.pattern}
        </span>
      </div>

      {/* Detail */}
      <div className="px-5 py-4">
        <p className="font-sans text-xs leading-[1.75]" style={{ color: 'rgba(255,255,255,0.45)' }}>{issue.detail}</p>

        {/* Diff */}
        <div className="mt-4 rounded-lg overflow-hidden text-xs font-mono" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-start gap-3 px-4 py-2.5" style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.12)' }}>
            <span style={{ color: '#F87171' }}>−</span>
            <span style={{ color: 'rgba(248,113,113,0.8)', lineHeight: 1.7 }}>{issue.original}</span>
          </div>
          <div className="flex items-start gap-3 px-4 py-2.5" style={{ background: 'rgba(34,197,94,0.06)' }}>
            <span style={{ color: '#4ADE80' }}>+</span>
            <span style={{ color: 'rgba(74,222,128,0.8)', lineHeight: 1.7 }}>{issue.improved}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Issue Item ───────────────────────────────────────────────────────────────

function IssueItem({
  issue,
  isActive,
  isApplied,
  onSelect,
  onApply,
}: {
  issue: Issue
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
      className="group relative rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: isApplied ? 'rgba(34,197,94,0.05)' : isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: `1px solid ${isApplied ? 'rgba(34,197,94,0.15)' : isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
        cursor: isApplied ? 'default' : 'pointer',
        opacity: isApplied ? 0.6 : 1,
      }}
    >
      <div className="px-4 py-3.5 flex items-start gap-3">
        {/* Severity dot */}
        <div className="mt-1 shrink-0">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: isApplied ? '#22C55E' : cfg.color }}
            animate={{ opacity: isActive && !isApplied ? [1, 0.4, 1] : 1 }}
            transition={{ duration: 1.2, repeat: isActive && !isApplied ? Infinity : 0 }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>{issue.id}</span>
            <span
              className="font-mono text-xs px-1.5 py-0.5 rounded"
              style={{ color: cfg.color, background: cfg.bg, fontSize: '9px', letterSpacing: '0.04em' }}
            >
              {cfg.label}
            </span>
            {isApplied && (
              <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ color: '#4ADE80', background: 'rgba(34,197,94,0.1)', fontSize: '9px' }}>
                Fixed
              </span>
            )}
          </div>
          <p
            className="font-sans text-sm leading-snug"
            style={{ color: isApplied ? 'rgba(255,255,255,0.3)' : '#F0EDE8', textDecoration: isApplied ? 'line-through' : 'none' }}
          >
            {issue.title}
          </p>
          <p className="font-mono text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>
            Line {issue.lineNum} · {issue.pattern}
          </p>
        </div>

        {/* Arrow */}
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

      {/* Expanded apply */}
      <AnimatePresence>
        {isActive && !isApplied && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3.5 pt-1">
              <div
                className="rounded-lg p-3 mb-3 font-mono text-xs leading-[1.7]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}
              >
                {issue.detail}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onApply() }}
                className="w-full font-sans text-xs font-medium py-2.5 rounded-lg transition-all duration-200 hover:opacity-90"
                style={{ background: issue.level === 'critical' ? 'rgba(239,68,68,0.15)' : issue.level === 'high' ? 'rgba(245,166,83,0.15)' : 'rgba(234,179,8,0.15)', color: cfg.color, border: `1px solid ${cfg.border}` }}
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

// ─── AI Recommendation Card ───────────────────────────────────────────────────

function AIRecCard({ rec, index, scanned }: { rec: typeof AI_RECS[0]; index: number; scanned: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={scanned ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.12, ease }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#141210', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
            style={{ background: 'rgba(245,166,83,0.12)', border: '1px solid rgba(245,166,83,0.2)' }}
          >
            <span style={{ color: '#F5A653', fontSize: '11px' }}>✦</span>
          </div>
          <span className="font-sans text-sm font-medium" style={{ color: '#F0EDE8' }}>{rec.title}</span>
        </div>

        <p className="font-sans text-xs leading-[1.75]" style={{ color: 'rgba(255,255,255,0.42)' }}>
          {rec.instruction}
        </p>

        <div
          className="mt-4 rounded-lg px-4 py-3"
          style={{ background: 'rgba(245,166,83,0.05)', border: '1px solid rgba(245,166,83,0.12)', borderLeft: '2px solid rgba(245,166,83,0.4)' }}
        >
          <span className="label-caps" style={{ fontSize: '9px', color: 'rgba(245,166,83,0.5)' }}>Example</span>
          <p className="font-mono text-xs mt-1.5 leading-[1.8] italic" style={{ color: 'rgba(245,166,83,0.7)' }}>
            {rec.example}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Scan Line ────────────────────────────────────────────────────────────────

function ScriptScanLine({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute inset-x-0 z-10 pointer-events-none"
          initial={{ top: '0%' }}
          animate={{ top: '100%' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.2, ease: 'linear' }}
        >
          <div
            className="h-[1.5px] w-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,166,83,0.25) 20%, #F5A653 50%, rgba(245,166,83,0.25) 80%, transparent)' }}
          />
          <div className="h-16 -translate-y-full" style={{ background: 'linear-gradient(to top, transparent, rgba(245,166,83,0.04))' }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RejectionPreventionStudio({ onBack }: { onBack: () => void }) {
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle')
  const [scannedIds, setScannedIds] = useState<Set<string>>(new Set())
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [riskScore, setRiskScore] = useState(RISK_SCORE_INITIAL)
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>('all')
  const scriptRef = useRef<HTMLDivElement>(null)

  // Auto-scan on mount
  useEffect(() => {
    const t0 = setTimeout(() => {
      setScanPhase('scanning')
      ISSUES.forEach((issue, i) => {
        setTimeout(() => {
          setScannedIds(prev => new Set([...prev, issue.id]))
        }, 350 + i * 280)
      })
      setTimeout(() => setScanPhase('complete'), 350 + ISSUES.length * 280 + 400)
    }, 1200)
    return () => clearTimeout(t0)
  }, [])

  const handleSelectIssue = useCallback((id: string) => {
    setActiveIssueId(prev => (prev === id ? null : id))

    // Scroll script to the issue line
    const issue = ISSUES.find(i => i.id === id)
    if (issue && scriptRef.current) {
      const el = scriptRef.current.querySelector(`[data-lineid="${issue.lineId}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const handleApply = useCallback((issueId: string) => {
    const issue = ISSUES.find(i => i.id === issueId)
    if (!issue) return

    setAppliedIds(prev => new Set([...prev, issueId]))
    setActiveIssueId(null)

    const reduction = issue.level === 'critical' ? 18 : issue.level === 'high' ? 10 : 5
    setRiskScore(prev => Math.max(0, prev - reduction))
  }, [])

  const filteredIssues = ISSUES.filter(i =>
    filterLevel === 'all' || i.level === filterLevel
  )

  const criticalCount = ISSUES.filter(i => i.level === 'critical').length
  const highCount = ISSUES.filter(i => i.level === 'high').length
  const mediumCount = ISSUES.filter(i => i.level === 'medium').length
  const appliedCount = appliedIds.size
  const scannedComplete = scanPhase === 'complete'

  const issueForLine = (issueId?: string) => issueId ? ISSUES.find(i => i.id === issueId) : undefined

  return (
    <div className="min-h-screen" style={{ background: '#0C0B09' }}>
      {/* ── Nav ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14"
        style={{ background: 'rgba(12,11,9,0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 font-sans text-sm transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              ← Explore brands
            </button>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>/</span>
            <span className="font-sans text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Rejection Prevention Studio</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Status */}
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: scannedComplete ? 1 : 0.5 }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: scanPhase === 'scanning' ? '#F5A653' : scannedComplete ? getRiskColor(riskScore) : 'rgba(255,255,255,0.2)' }}
                animate={{ opacity: scanPhase === 'scanning' ? [1, 0.3, 1] : 1 }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
              <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                {scanPhase === 'idle' ? 'ready' : scanPhase === 'scanning' ? 'scanning' : `${appliedCount}/${ISSUES.length} fixed`}
              </span>
            </motion.div>

            <button
              onClick={onBack}
              className="font-sans text-sm font-medium px-4 py-1.5 rounded-lg"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            >
              ← Back
            </button>
            <button
              className="font-sans text-sm font-medium px-4 py-1.5 rounded-lg"
              style={{ background: '#D97C28', color: '#fff' }}
            >
              Export report →
            </button>
          </div>
        </div>
      </header>

      {/* ── Top accent line ── */}
      <div className="pt-14">
        <div className="h-[1.5px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,166,83,0.4), transparent)' }} />
      </div>

      {/* ── Risk Header ── */}
      <div
        className="sticky top-14 z-40"
        style={{ background: 'rgba(12,11,9,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center gap-8">
          {/* Gauge */}
          <div className="flex items-center gap-4 shrink-0">
            <RiskGauge score={riskScore} animated={scannedComplete} />
            <div>
              <motion.p
                className="font-sans text-sm font-semibold"
                animate={{ color: getRiskColor(riskScore) }}
                transition={{ duration: 0.5 }}
              >
                {getRiskLabel(riskScore)}
              </motion.p>
              <p className="font-sans text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Nike Campaign · @sarah_runs
              </p>
            </div>
          </div>

          <div className="w-px h-10 shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Issue counts */}
          <div className="flex items-center gap-6">
            {[
              { label: 'Critical', count: criticalCount, color: '#EF4444', level: 'critical' as RiskLevel },
              { label: 'High', count: highCount, color: '#F5A653', level: 'high' as RiskLevel },
              { label: 'Medium', count: mediumCount, color: '#EAB308', level: 'medium' as RiskLevel },
            ].map(({ label, count, color, level }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 6 }}
                animate={scannedComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                transition={{ duration: 0.4, delay: level === 'critical' ? 0.1 : level === 'high' ? 0.2 : 0.3 }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="font-mono text-sm" style={{ color }}>{count}</span>
                <span className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
              </motion.div>
            ))}
          </div>

          <div className="w-px h-10 shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Progress */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {appliedCount === 0 ? 'Review issues below to fix' : `${appliedCount} of ${ISSUES.length} issues resolved`}
              </span>
              <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>
                {appliedCount}/{ISSUES.length}
              </span>
            </div>
            <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #22C55E, #4ADE80)' }}
                animate={{ width: `${(appliedCount / ISSUES.length) * 100}%` }}
                transition={{ duration: 0.6, ease }}
              />
            </div>
          </div>

          {/* Scan status */}
          <AnimatePresence>
            {scanPhase === 'scanning' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 shrink-0"
              >
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{ background: '#F5A653' }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
                <span className="font-mono text-xs" style={{ color: 'rgba(245,166,83,0.6)', fontSize: '11px' }}>AI scanning</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 380px' }}>

          {/* ── Left: Script Panel ── */}
          <div>
            {/* Script header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="label-caps" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>Script under review</span>
                <div
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="w-1 h-1 rounded-full" style={{ background: '#F5A653' }} />
                  <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>nike_campaign_v3.txt</span>
                </div>
              </div>
              <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>
                {ISSUES.length} issues · {SCRIPT_LINES.filter(l => l.type === 'content').length} lines
              </span>
            </div>

            {/* Script viewer */}
            <div
              ref={scriptRef}
              className="rounded-2xl overflow-hidden relative"
              style={{ background: '#141210', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <ScriptScanLine active={scanPhase === 'scanning'} />

              {/* File tab bar */}
              <div
                className="flex items-center gap-0 px-4 pt-3 pb-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="flex items-center gap-2 px-3 pb-2.5 pt-0"
                  style={{ borderBottom: '2px solid #F5A653' }}
                >
                  <span className="font-mono text-xs" style={{ color: '#F5A653', fontSize: '11px' }}>nike_campaign_v3.txt</span>
                  <span
                    className="font-mono text-xs px-1 rounded"
                    style={{ color: '#EF4444', background: 'rgba(239,68,68,0.12)', fontSize: '9px' }}
                  >
                    {ISSUES.length - appliedCount} issues
                  </span>
                </div>
              </div>

              {/* Script content */}
              <div className="py-3">
                {SCRIPT_LINES.map(line => {
                  const issue = issueForLine(line.issueId)
                  const isScanned = issue ? scannedIds.has(issue.id) : false
                  const isActive = issue ? activeIssueId === issue.id : false
                  const isApplied = issue ? appliedIds.has(issue.id) : false

                  return (
                    <div key={line.id} data-lineid={line.id}>
                      <ScriptLineView
                        line={line}
                        issue={issue}
                        isActive={isActive}
                        isScanned={isScanned}
                        isApplied={isApplied}
                        onSelect={() => issue && handleSelectIssue(issue.id)}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Bottom status bar */}
              <div
                className="px-4 py-2 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
              >
                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>
                  {appliedCount > 0 ? `${appliedCount} fix${appliedCount > 1 ? 'es' : ''} applied` : 'Click any highlighted line to review'}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: scanPhase === 'complete' ? '#22C55E' : '#F5A653' }} />
                  <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>
                    {scanPhase === 'idle' ? 'Waiting' : scanPhase === 'scanning' ? 'Scanning...' : 'Review complete'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Issues + AI Panel ── */}
          <div className="space-y-5">
            {/* Issues panel */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#141210', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Issues header */}
              <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="label-caps" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Rejection Risks</span>
                  <motion.span
                    className="font-mono text-xs"
                    animate={{ color: getRiskColor(riskScore) }}
                    style={{ fontSize: '10px' }}
                  >
                    {ISSUES.length - appliedCount} open
                  </motion.span>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1">
                  {(['all', 'critical', 'high', 'medium'] as const).map(level => {
                    const count = level === 'all' ? ISSUES.length : ISSUES.filter(i => i.level === level).length
                    const isActive = filterLevel === level
                    return (
                      <button
                        key={level}
                        onClick={() => setFilterLevel(level)}
                        className="font-sans text-xs px-2.5 py-1 rounded-md transition-all duration-150 capitalize"
                        style={{
                          background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                          color: isActive
                            ? level === 'all' ? '#F0EDE8' : LEVEL_CONFIG[level as RiskLevel]?.color || '#F0EDE8'
                            : 'rgba(255,255,255,0.3)',
                          fontSize: '11px',
                        }}
                      >
                        {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)} <span style={{ opacity: 0.5 }}>({count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Issue list */}
              <div className="p-3 space-y-2 max-h-[480px] overflow-y-auto">
                <AnimatePresence>
                  {filteredIssues.map((issue, i) => {
                    const isScanned = scannedIds.has(issue.id)
                    if (!isScanned) return null
                    return (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.4, delay: i * 0.04, ease }}
                      >
                        <IssueItem
                          issue={issue}
                          isActive={activeIssueId === issue.id}
                          isApplied={appliedIds.has(issue.id)}
                          onSelect={() => handleSelectIssue(issue.id)}
                          onApply={() => handleApply(issue.id)}
                        />
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {/* Loading state */}
                {scanPhase === 'scanning' && scannedIds.size < ISSUES.length && (
                  <div className="flex items-center gap-2 px-3 py-2">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{ background: '#F5A653' }}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 0.7, delay: i * 0.18, repeat: Infinity }}
                      />
                    ))}
                    <span className="font-mono text-xs" style={{ color: 'rgba(245,166,83,0.45)', fontSize: '10px' }}>Detecting...</span>
                  </div>
                )}
              </div>

              {/* Apply all */}
              <AnimatePresence>
                {scannedComplete && appliedCount < ISSUES.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 pb-4 pt-1"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <button
                      onClick={() => {
                        ISSUES.forEach(i => handleApply(i.id))
                      }}
                      className="w-full font-sans text-xs font-medium py-2.5 rounded-lg transition-all duration-200"
                      style={{ background: 'rgba(34,197,94,0.1)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.2)' }}
                    >
                      Apply all AI fixes →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Recommendations */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(245,166,83,0.12)', border: '1px solid rgba(245,166,83,0.2)' }}
                  >
                    <span style={{ color: '#F5A653', fontSize: '9px' }}>✦</span>
                  </div>
                  <span className="label-caps" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>AI Recommendations</span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {AI_RECS.map((rec, i) => (
                  <AIRecCard key={rec.id} rec={rec} index={i} scanned={scannedComplete} />
                ))}
              </div>
            </div>

            {/* Score forecast */}
            <AnimatePresence>
              {scannedComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5, ease }}
                  className="rounded-2xl p-5"
                  style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}
                >
                  <span className="label-caps" style={{ fontSize: '9px', color: 'rgba(34,197,94,0.5)' }}>Forecast</span>
                  <p className="font-sans text-sm font-medium mt-1.5" style={{ color: '#F0EDE8' }}>
                    Apply all fixes → approx. 0% risk score
                  </p>
                  <p className="font-sans text-xs mt-1 leading-[1.7]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Resolving the 3 critical issues alone drops your risk below 30%.
                    Nike approval likelihood increases from 12% to ~71%.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
