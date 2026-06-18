import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BRAND_PROFILES,
  LOADING_STEPS,
  analyzeBrand,
  loadHistory,
  saveToHistory,
  copyAnalysis,
  downloadTextReport,
  downloadJsonReport,
  type BrandAnalysis,
} from '../../services/voiceArchaeologyService'

const ease = [0.16, 1, 0.3, 1] as const

// ── Sub-components ─────────────────────────────────────────────

function MiniRing({ score, size = 40 }: { score: number; size?: number }) {
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
        stroke="#F5A653"
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

function BarMeter({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-sans text-[11px] text-white/40">{label}</span>
        <span className="font-mono text-[11px] text-ember-400/80">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#2A2722' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, delay: 0.3, ease }}
          style={{ background: '#F5A653', opacity: 0.75 }}
        />
      </div>
    </div>
  )
}

function CopyButton({ onClick, label }: { onClick: () => void; label: string }) {
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
      {flash ? '✓ Done' : label}
    </button>
  )
}

// ── Loading card ───────────────────────────────────────────────

function LoadingCard({ step, brandName }: { step: number; brandName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease }}
      className="rounded-2xl overflow-hidden border border-studio-brd"
      style={{ background: '#0F0E0B' }}
    >
      <div className="px-6 py-4 border-b border-studio-brd flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-ember-400/10 border border-ember-400/20 flex items-center justify-center">
          <span className="text-[9px] text-ember-400">◈</span>
        </div>
        <span className="label-caps text-white/40">Analyzing {brandName}</span>
        <div className="ml-auto flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-ember-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>

      <div className="p-8">
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
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                    i < step
                      ? 'bg-emerald-500/20 border-emerald-500/40'
                      : i === step
                      ? 'border-ember-400/40 bg-ember-400/10'
                      : 'border-studio-brd bg-transparent'
                  }`}
                >
                  {i < step ? (
                    <span className="text-emerald-400 text-[9px]">✓</span>
                  ) : i === step ? (
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-ember-400"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  ) : null}
                </div>
                <span
                  className={`font-sans text-[12px] transition-colors duration-300 ${
                    i < step
                      ? 'text-emerald-400/70'
                      : i === step
                      ? 'text-white/70'
                      : 'text-white/20'
                  }`}
                >
                  {msg}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="h-1 rounded-full overflow-hidden" style={{ background: '#2A2722' }}>
            <motion.div
              className="h-full rounded-full bg-ember-600"
              animate={{ width: `${((step + 1) / LOADING_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Analysis output card ───────────────────────────────────────

function AnalysisCard({ analysis }: { analysis: BrandAnalysis }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await copyAnalysis(analysis)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <motion.div
      key={analysis.brandId + analysis.analyzedAt}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease }}
    >
      {/* Brand header */}
      <div
        className="rounded-2xl overflow-hidden border border-studio-brd mb-4"
        style={{ background: '#0F0E0B' }}
      >
        <div className="px-6 py-4 border-b border-studio-brd flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-ember-400/10 border border-ember-400/20 flex items-center justify-center">
              <span className="text-[9px] text-ember-400">◈</span>
            </div>
            <span className="label-caps text-white/40">Voice Archaeology Report</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-[11px] text-white/25">
              {analysis.postsAnalyzed.toLocaleString()} posts
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-ember-400/60" />
          </div>
        </div>

        {/* Brand identity */}
        <div className="px-6 py-5 border-b border-studio-brd/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0">
            <span className="font-serif font-bold text-studio-bg text-xl">
              {analysis.brandName[0]}
            </span>
          </div>
          <div className="flex-1">
            <div className="font-serif text-xl text-white">{analysis.brandName}</div>
            <div className="font-sans text-[11px] text-white/35 mt-0.5">{analysis.brandCategory}</div>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            <div className="text-right">
              <div className="label-caps text-white/20 mb-1">Brand Score</div>
              <div className="font-mono text-[18px] font-semibold text-ember-400">
                {analysis.brandScore}%
              </div>
            </div>
            <div className="text-right">
              <div className="label-caps text-white/20 mb-1">Confidence</div>
              <div className="font-mono text-[18px] font-semibold text-white/70">
                {analysis.approvalConfidence}%
              </div>
            </div>
          </div>
        </div>

        {/* What they say / reward */}
        <div className="p-5 border-b border-studio-brd/50">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <div className="label-caps text-white/25 mb-3">What They Say</div>
              <div className="flex flex-wrap gap-2">
                {analysis.whatTheySay.map((tag) => (
                  <span
                    key={tag}
                    className="font-sans text-[11px] text-white/50 px-2.5 py-1 rounded-full border border-studio-brd"
                    style={{ background: '#1C1A17' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="label-caps text-ember-400/60 mb-3">What They Reward</div>
              <div className="flex flex-wrap gap-2">
                {analysis.whatTheyReward.map((tag) => (
                  <span
                    key={tag}
                    className="font-sans text-[11px] text-ember-400/60 px-2.5 py-1 rounded-full border border-ember-600/25"
                    style={{ background: 'rgba(217,124,40,0.06)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pattern rows */}
          <div className="mt-4">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mb-3">
              <span className="label-caps text-white/25">What they say</span>
              <span className="text-white/15 text-xs">→</span>
              <span className="label-caps text-ember-400/60">What they reward</span>
            </div>
            {analysis.patterns.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + i * 0.07, ease }}
                className={`grid grid-cols-[1fr_auto_1fr] gap-3 items-start p-3 rounded-xl mb-2 ${
                  i === 0 ? 'border border-ember-600/15' : 'border border-transparent'
                }`}
                style={{ background: i === 0 ? 'rgba(139,75,16,0.15)' : 'rgba(28,26,23,0.4)' }}
              >
                <span className="font-mono text-[12px] text-white/45">{p.says}</span>
                <span className="text-white/15 text-xs mt-0.5">→</span>
                <span className="font-sans text-[12px] text-white/70 leading-relaxed">{p.rewards}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tone patterns */}
        <div className="p-5 border-b border-studio-brd/50">
          <div className="label-caps text-white/25 mb-4">Tone Patterns</div>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="space-y-3">
              <div>
                <div className="label-caps text-white/20 mb-1">Primary Tone</div>
                <div className="font-sans text-[14px] font-semibold text-white/80">
                  {analysis.tonePatterns.primary}
                </div>
              </div>
              <div>
                <div className="label-caps text-white/20 mb-1">Secondary Tone</div>
                <div className="font-sans text-[14px] text-white/60">
                  {analysis.tonePatterns.secondary}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="label-caps text-white/20 mb-1">Narrative Style</div>
                <div className="font-sans text-[14px] text-white/60">
                  {analysis.tonePatterns.narrativeStyle}
                </div>
              </div>
            </div>
          </div>
          <BarMeter value={analysis.tonePatterns.emotionalIntensity} label="Emotional Intensity" />
        </div>

        {/* Approval triggers */}
        <div className="p-5 border-b border-studio-brd/50">
          <div className="label-caps text-white/25 mb-3">Approval Triggers</div>
          <div className="space-y-2">
            {analysis.approvalTriggers.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + i * 0.07, ease }}
                className="flex items-start gap-3 rounded-xl px-4 py-3 border border-studio-brd/50"
                style={{ background: 'rgba(28,26,23,0.4)' }}
              >
                <span
                  className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(187,247,208,0.12)', borderColor: 'rgba(134,239,172,0.3)' }}
                >
                  <span className="text-emerald-400 text-[9px]">✓</span>
                </span>
                <span className="font-sans text-[12px] text-white/60 leading-relaxed">{t}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Forbidden language */}
        <div className="p-5 border-b border-studio-brd/50">
          <div className="label-caps text-white/25 mb-3">Forbidden Language</div>
          <div className="space-y-2">
            {analysis.forbiddenLanguage.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + i * 0.07, ease }}
                className="flex items-start gap-3 rounded-xl px-4 py-3 border border-studio-brd/40"
                style={{ background: 'rgba(127,29,29,0.1)' }}
              >
                <span
                  className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(254,202,202,0.1)', borderColor: 'rgba(252,165,165,0.25)' }}
                >
                  <span className="text-red-400 text-[9px]">✗</span>
                </span>
                <span className="font-sans text-[12px] text-white/50 leading-relaxed">{f}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pattern insight */}
        <div
          className="m-5 rounded-xl p-4 border border-ember-600/20"
          style={{ background: 'rgba(139,75,16,0.12)' }}
        >
          <div className="label-caps text-ember-400/70 mb-2">Pattern Insight</div>
          <p className="font-sans text-[12px] text-white/65 leading-relaxed italic">
            "{analysis.patternInsight}"
          </p>
        </div>
      </div>

      {/* Export bar */}
      <div
        className="rounded-xl p-4 border border-studio-brd flex flex-wrap items-center justify-between gap-3"
        style={{ background: '#141210' }}
      >
        <span className="label-caps text-white/25">Export Analysis</span>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="font-sans text-[11px] font-medium px-3 py-1.5 rounded-lg border border-studio-brd text-white/40 hover:text-white/70 hover:border-studio-ele transition-all duration-150"
            style={{ background: '#1C1A17' }}
          >
            {copied ? '✓ Copied' : 'Copy Analysis'}
          </button>
          <CopyButton onClick={() => downloadTextReport(analysis)} label="Download Report" />
          <CopyButton onClick={() => downloadJsonReport(analysis)} label="Download JSON" />
        </div>
      </div>
    </motion.div>
  )
}

// ── Empty state ────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease }}
      className="rounded-2xl border border-dashed border-studio-brd/50 flex flex-col items-center justify-center py-20 px-8 text-center"
      style={{ background: '#0F0E0B' }}
    >
      <div className="font-mono text-[32px] text-white/8 mb-4">◉</div>
      <div className="font-sans text-[14px] font-medium text-white/30 mb-2">
        Select a brand to begin
      </div>
      <div className="font-sans text-[12px] text-white/20 max-w-xs leading-relaxed">
        Choose any brand from the list, then click "Analyze Brand DNA" to extract its voice patterns.
      </div>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────

export default function VoiceArchaeologyPage() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [analysis, setAnalysis] = useState<BrandAnalysis | null>(null)
  const [history, setHistory] = useState<BrandAnalysis[]>(() => loadHistory())
  const [showHistory, setShowHistory] = useState(false)
  const analyzeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalPosts = BRAND_PROFILES.reduce((a, b) => a + b.posts, 0)

  const filteredBrands = BRAND_PROFILES.filter(
    (b) =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.category.toLowerCase().includes(query.toLowerCase()),
  )

  function selectBrand(id: string) {
    if (analyzing) return
    setSelectedId(id)
    setAnalysis(null)
  }

  function openFromHistory(a: BrandAnalysis) {
    setSelectedId(a.brandId)
    setAnalysis(a)
    setShowHistory(false)
  }

  async function runAnalysis() {
    if (!selectedId || analyzing) return

    setAnalyzing(true)
    setLoadingStep(0)
    setAnalysis(null)

    // Step through loading messages
    const stepDuration = 600
    for (let i = 1; i < LOADING_STEPS.length; i++) {
      await new Promise<void>((resolve) => {
        analyzeTimerRef.current = setTimeout(() => { setLoadingStep(i); resolve() }, stepDuration)
      })
    }

    // Final pause before showing result
    await new Promise<void>((resolve) => {
      analyzeTimerRef.current = setTimeout(resolve, 500)
    })

    const result = analyzeBrand(selectedId)
    const updated = saveToHistory(result)
    setHistory(updated)
    setAnalysis(result)
    setAnalyzing(false)
  }

  useEffect(() => {
    return () => {
      if (analyzeTimerRef.current) clearTimeout(analyzeTimerRef.current)
    }
  }, [])

  const selectedProfile = BRAND_PROFILES.find((b) => b.id === selectedId)

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">01 — Voice Archaeology</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          Decode the DNA of any brand.
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2 max-w-md">
          Behavioral patterns extracted from what got approved — and what got rejected — across{' '}
          {totalPosts.toLocaleString()} analyzed posts.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* ── Left: Brand selector ── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease }}
        >
          {/* Search input */}
          <div className="relative mb-3">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 text-sm pointer-events-none select-none">
              ⌕
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brands…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-studio-brd font-sans text-[13px] text-white/70 placeholder-white/20 focus:outline-none focus:border-studio-ele transition-colors duration-150"
              style={{ background: '#141210' }}
            />
          </div>

          <div className="label-caps text-white/25 mb-2">
            {query ? `${filteredBrands.length} result${filteredBrands.length !== 1 ? 's' : ''}` : 'Select Brand'}
          </div>

          {/* Brand list */}
          <div className="space-y-2 mb-4">
            <AnimatePresence mode="popLayout">
              {filteredBrands.length === 0 ? (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl p-4 border border-dashed border-studio-brd/40 text-center"
                  style={{ background: '#141210' }}
                >
                  <span className="font-sans text-[11px] text-white/20">No brands match</span>
                </motion.div>
              ) : (
                filteredBrands.map((b) => {
                  const isSelected = selectedId === b.id
                  const inHistory = history.some((h) => h.brandId === b.id)
                  return (
                    <motion.button
                      key={b.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25, ease }}
                      onClick={() => selectBrand(b.id)}
                      disabled={analyzing}
                      className={`w-full text-left rounded-xl p-4 border transition-all duration-150 disabled:opacity-50 ${
                        isSelected
                          ? 'border-ember-600/40 text-white'
                          : 'border-studio-brd text-white/50 hover:text-white/70 hover:border-studio-ele'
                      }`}
                      style={{ background: isSelected ? 'rgba(217,124,40,0.08)' : '#141210' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-[13px] font-semibold truncate">{b.name}</span>
                            {inHistory && (
                              <span
                                className="label-caps shrink-0"
                                style={{ color: '#F5A653', fontSize: 8, opacity: 0.6 }}
                              >
                                analyzed
                              </span>
                            )}
                          </div>
                          <div className="font-sans text-[11px] text-white/30 mt-0.5 truncate">
                            {b.category}
                          </div>
                        </div>
                        {isSelected && !analyzing && analysis?.brandId === b.id && (
                          <MiniRing score={analysis.brandScore} size={34} />
                        )}
                      </div>
                      <div className="font-sans text-[10px] text-white/20 mt-2">
                        {b.posts.toLocaleString()} posts analyzed
                      </div>
                    </motion.button>
                  )
                })
              )}
            </AnimatePresence>
          </div>

          {/* Analyze button */}
          <AnimatePresence>
            {selectedId && !analyzing && (
              <motion.button
                key="analyze-btn"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.3, ease }}
                onClick={runAnalysis}
                className="w-full rounded-xl px-4 py-3 font-sans text-[13px] font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #D97C28 0%, #A8561A 100%)' }}
              >
                Analyze Brand DNA →
              </motion.button>
            )}
          </AnimatePresence>

          {/* Recent analyses */}
          {history.length > 0 && (
            <div className="mt-4">
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
                          key={h.brandId + h.analyzedAt}
                          onClick={() => openFromHistory(h)}
                          className="w-full text-left flex items-center justify-between rounded-xl px-4 py-3 border border-studio-brd/40 hover:border-studio-ele transition-all duration-150 group"
                          style={{ background: '#141210' }}
                        >
                          <div>
                            <div className="font-sans text-[12px] font-medium text-white/60 group-hover:text-white/80 transition-colors">
                              {h.brandName}
                            </div>
                            <div className="font-sans text-[10px] text-white/20 mt-0.5">
                              {new Date(h.analyzedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                          <span className="font-mono text-[11px] text-ember-400/60">{h.brandScore}%</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* ── Right: Analysis output ── */}
        <div>
          <AnimatePresence mode="wait">
            {analyzing && selectedProfile ? (
              <LoadingCard
                key="loading"
                step={loadingStep}
                brandName={selectedProfile.name}
              />
            ) : analysis ? (
              <AnalysisCard key={analysis.brandId + analysis.analyzedAt} analysis={analysis} />
            ) : (
              <EmptyState key="empty" />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
