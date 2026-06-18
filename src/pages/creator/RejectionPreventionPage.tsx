import { useState } from 'react'
import { motion } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1] as const

const SCRIPT_LINES = [
  { n: '01', text: "Hey everyone! I'm SO excited to finally share these with you.", level: 'warn' as const, issue: 'Weak hook — no tension or motion' },
  { n: '08', text: "These shoes are honestly the most comfortable I've ever worn.", level: 'critical' as const, issue: '"Comfortable" — Nike zero tolerance' },
  { n: '12', text: "Use my code SARAH15 for 15% off your first order!", level: 'critical' as const, issue: 'Promo code — 100% rejection signal' },
  { n: '22', text: 'The grip held on a 14km trail ascent.', level: 'clean' as const, issue: '' },
  { n: '31', text: "I've been wearing them nonstop — even just sitting at home.", level: 'medium' as const, issue: 'Static usage — contradicts athletic brand narrative' },
]

export default function RejectionPreventionPage() {
  const [applied, setApplied] = useState(false)

  const riskScore = applied ? 18 : 78
  const criticalCount = SCRIPT_LINES.filter(l => l.level === 'critical').length

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
          Intent flags weak hooks, banned words, tone mismatches, and known rejection patterns — line by line, before you invest time in production.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Script viewer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease }}
          className="rounded-2xl overflow-hidden border border-studio-brd"
          style={{ background: '#0F0E0B' }}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-studio-brd flex items-center justify-between">
            <span className="label-caps text-white/30">nike_collab_v3.txt</span>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[11px] text-white/25">{applied ? '1 issue' : '5 issues'}</span>
              <span
                className="font-sans text-[11px] font-semibold px-2 py-0.5 rounded"
                style={{
                  background: riskScore > 50 ? '#7F1D1D' : '#14532D',
                  color: riskScore > 50 ? '#FCA5A5' : '#86EFAC',
                  fontSize: 10,
                }}
              >
                {riskScore}% risk
              </span>
            </div>
          </div>

          {/* Script lines */}
          <div className="p-4 space-y-1">
            {SCRIPT_LINES.map(line => (
              <div
                key={line.n}
                className={`rounded-lg px-4 py-3 ${
                  applied && line.level !== 'clean'
                    ? ''
                    : line.level === 'critical'
                      ? 'border-l-2 border-red-500'
                      : line.level === 'warn'
                        ? 'border-l-2 border-amber-500'
                        : line.level === 'medium'
                          ? 'border-l-2 border-yellow-600'
                          : ''
                }`}
                style={{
                  background:
                    !applied && line.level === 'critical'
                      ? 'rgba(127,29,29,0.3)'
                      : !applied && line.level === 'warn'
                        ? 'rgba(120,53,15,0.2)'
                        : !applied && line.level === 'medium'
                          ? 'rgba(113,63,18,0.15)'
                          : 'transparent',
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-[10px] text-white/20 mt-0.5 shrink-0 w-4">
                    {line.n}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-mono text-[12px] leading-relaxed ${applied && line.level !== 'clean' ? 'text-white/25 line-through' : 'text-white/55'}`}>
                      {line.text}
                    </p>
                    {!applied && line.issue && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span
                          className={`font-sans text-[10px] font-medium ${
                            line.level === 'critical'
                              ? 'text-red-400'
                              : line.level === 'warn'
                                ? 'text-amber-400'
                                : 'text-yellow-500'
                          }`}
                        >
                          {line.level === 'critical'
                            ? '● Critical'
                            : line.level === 'warn'
                              ? '● Warning'
                              : '● Medium'}
                        </span>
                        <span className="font-sans text-[10px] text-white/25">{line.issue}</span>
                      </div>
                    )}
                    {applied && line.level !== 'clean' && (
                      <div className="mt-1.5">
                        <span className="font-mono text-[11px] text-emerald-400/70">
                          {line.level === 'critical' && line.n === '08'
                            ? 'Still locked in after 18km of technical trail.'
                            : line.level === 'critical' && line.n === '12'
                              ? '[Promo code section removed]'
                              : line.level === 'warn'
                                ? '[Opening with trail ascent motion — no greeting]'
                                : '[Gym bag scene removed — replaced with b-roll]'}
                        </span>
                      </div>
                    )}
                  </div>
                  {line.level === 'clean' && (
                    <span className="text-emerald-400 text-[10px] shrink-0">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* AI fix suggestion */}
          {!applied && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mx-4 mb-4 rounded-xl overflow-hidden border border-studio-brd"
            >
              <div className="px-4 py-2 border-b border-studio-brd" style={{ background: '#1C1A17' }}>
                <span className="label-caps text-white/25">AI Suggested Fix · Line 08</span>
              </div>
              <div className="p-4 space-y-1.5">
                <div className="flex items-start gap-2.5 rounded px-3 py-2" style={{ background: 'rgba(127,29,29,0.25)' }}>
                  <span className="text-red-400 text-[11px] shrink-0 mt-0.5">−</span>
                  <span className="font-mono text-[11px] text-red-300/60 line-through">
                    These shoes are so comfortable…
                  </span>
                </div>
                <div className="flex items-start gap-2.5 rounded px-3 py-2" style={{ background: 'rgba(6,78,59,0.25)' }}>
                  <span className="text-emerald-400 text-[11px] shrink-0 mt-0.5">+</span>
                  <span className="font-mono text-[11px] text-emerald-300/70">
                    Still locked in after 18km of technical trail.
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <div className="px-5 py-4 border-t border-studio-brd flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: riskScore > 50 ? '#EF4444' : '#22C55E' }}
              >
                <span
                  className="font-sans font-semibold text-[11px]"
                  style={{ color: riskScore > 50 ? '#F87171' : '#4ADE80' }}
                >
                  {riskScore}
                </span>
              </div>
              <div>
                <div
                  className="font-sans text-[10px] font-semibold"
                  style={{ color: riskScore > 50 ? '#F87171' : '#4ADE80' }}
                >
                  {riskScore > 50 ? 'VERY HIGH RISK' : 'LOW RISK'}
                </div>
                <div className="font-sans text-[10px] text-white/25">
                  {applied ? 'All AI fixes applied' : `${criticalCount} critical · 2 high · 1 medium`}
                </div>
              </div>
            </div>
            {!applied && (
              <button
                onClick={() => setApplied(true)}
                className="font-sans text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors duration-200 hover:opacity-90"
                style={{ background: '#D97C28', color: 'white' }}
              >
                Apply all fixes →
              </button>
            )}
            {applied && (
              <button
                onClick={() => setApplied(false)}
                className="font-sans text-[11px] text-white/30 hover:text-white/60 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="space-y-4"
        >
          {/* Risk legend */}
          <div
            className="rounded-xl p-5 border border-studio-brd"
            style={{ background: '#141210' }}
          >
            <div className="label-caps text-white/25 mb-4">Risk Levels</div>
            <div className="space-y-3">
              {[
                { color: 'bg-red-500', label: 'Critical', desc: 'Immediate rejection triggers' },
                { color: 'bg-amber-500', label: 'High risk', desc: 'Known brand friction patterns' },
                { color: 'bg-yellow-600', label: 'Medium', desc: 'Suboptimal but recoverable' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                  <span className="font-sans text-[12px] font-medium text-white/60">{item.label}</span>
                  <span className="font-sans text-[11px] text-white/25">— {item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upload prompt */}
          <div
            className="rounded-xl p-5 border border-dashed border-studio-brd/50 text-center"
          >
            <div className="font-mono text-2xl text-white/10 mb-3">⬡</div>
            <div className="font-sans text-[12px] font-medium text-white/40 mb-1">
              Analyze your script
            </div>
            <div className="font-sans text-[11px] text-white/20 leading-relaxed">
              Paste your script or caption to get a real-time rejection risk analysis
            </div>
            <div className="mt-3 font-sans text-[10px] text-white/15">
              Custom analysis · Phase 2
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
