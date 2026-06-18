import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  searchBrands,
  getSavedBrandIds,
  toggleSaveBrand,
  formatBudget,
  scoreColor,
  scoreLabel,
  getTotalCount,
  DIFFICULTY_CONFIG,
  CATEGORY_COLORS,
  type DiscoveryBrand,
  type BrandCategory,
  type FilterCategory,
  type SortOption,
} from '../../services/brandDiscoveryService'

const ease = [0.16, 1, 0.3, 1] as const

const CATEGORIES: BrandCategory[] = ['Fashion', 'Beauty', 'Fitness', 'Tech', 'Food', 'Travel']

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'match',    label: 'Highest Match'    },
  { value: 'budget',   label: 'Highest Budget'   },
  { value: 'approval', label: 'Easiest Approval' },
  { value: 'newest',   label: 'Newest Campaigns' },
]

// ── Score ring (SVG) ──────────────────────────────────────────

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const color = scoreColor(score)
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const cx = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
      />
      <text x={cx} y={cx + 5} textAnchor="middle" fill="white" fontSize="13" fontWeight="600" fontFamily="JetBrains Mono, monospace">
        {score}
      </text>
    </svg>
  )
}

// ── Brand profile modal ───────────────────────────────────────

function BrandModal({
  brand,
  isSaved,
  onSave,
  onClose,
}: {
  brand: DiscoveryBrand
  isSaved: boolean
  onSave: () => void
  onClose: () => void
}) {
  const diffCfg = DIFFICULTY_CONFIG[brand.difficulty]
  const catColor = CATEGORY_COLORS[brand.category]
  const bars = Math.round(brand.compatibilityScore / 10)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(12,11,9,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.3, ease }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl overflow-hidden border border-studio-brd"
        style={{ background: '#0F0E0B', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Modal header */}
        <div
          className="px-6 py-4 border-b border-studio-brd flex items-start justify-between gap-4"
          style={{ background: '#141210' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl border border-studio-brd flex items-center justify-center shrink-0"
              style={{ background: '#1C1A17' }}
            >
              <span className="font-serif font-bold text-base" style={{ color: catColor }}>{brand.name[0]}</span>
            </div>
            <div>
              <div className="font-sans text-[15px] font-semibold text-white">{brand.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="font-mono text-[9px] px-2 py-0.5 rounded"
                  style={{ color: catColor, background: catColor + '18', border: `1px solid ${catColor}30` }}
                >
                  {brand.category}
                </span>
                <span
                  className="font-mono text-[9px] px-2 py-0.5 rounded"
                  style={{ color: diffCfg.color, background: diffCfg.bg }}
                >
                  {diffCfg.label}
                </span>
                <span className="font-mono text-[9px] text-white/25">
                  {brand.campaignCount} active campaigns
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="font-sans text-[18px] text-white/25 hover:text-white/60 transition-colors shrink-0 mt-0.5"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Scores row */}
          <div className="grid grid-cols-3 gap-3">
            <div
              className="rounded-xl p-4 text-center border border-studio-brd"
              style={{ background: '#141210' }}
            >
              <div className="flex justify-center mb-2">
                <ScoreRing score={brand.compatibilityScore} size={60} />
              </div>
              <div className="label-caps text-white/25" style={{ fontSize: '8px' }}>Compatibility</div>
              <div className="font-sans text-[10px] font-medium mt-0.5" style={{ color: scoreColor(brand.compatibilityScore) }}>
                {scoreLabel(brand.compatibilityScore)}
              </div>
            </div>

            <div
              className="rounded-xl p-4 text-center border border-studio-brd"
              style={{ background: '#141210' }}
            >
              <div
                className="font-mono text-[26px] font-semibold mb-1"
                style={{ color: brand.approvalRate >= 70 ? '#22C55E' : brand.approvalRate >= 50 ? '#EAB308' : '#F5A653' }}
              >
                {brand.approvalRate}%
              </div>
              <div className="label-caps text-white/25" style={{ fontSize: '8px' }}>Approval Rate</div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${brand.approvalRate}%` }}
                  transition={{ duration: 0.8, ease }}
                  style={{ background: brand.approvalRate >= 70 ? '#22C55E' : brand.approvalRate >= 50 ? '#EAB308' : '#F5A653' }}
                />
              </div>
            </div>

            <div
              className="rounded-xl p-4 text-center border border-studio-brd"
              style={{ background: '#141210' }}
            >
              <div className="font-mono text-[12px] font-semibold text-white/80 mb-1 leading-snug">
                {formatBudget(brand.budgetMin, brand.budgetMax)}
              </div>
              <div className="label-caps text-white/25 mb-2" style={{ fontSize: '8px' }}>Per Campaign</div>
              <div
                className="font-mono text-[9px] px-2 py-0.5 rounded"
                style={{ color: diffCfg.color, background: diffCfg.bg }}
              >
                {diffCfg.label} entry
              </div>
            </div>
          </div>

          {/* Compatibility bars */}
          <div>
            <div className="label-caps text-white/25 mb-3">Compatibility Score</div>
            <div className="flex items-center gap-1 mb-1.5">
              {Array.from({ length: 10 }).map((_, j) => (
                <motion.div
                  key={j}
                  className="h-2 flex-1 rounded-full"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.3, delay: j * 0.04, ease }}
                  style={{ background: j < bars ? scoreColor(brand.compatibilityScore) + 'cc' : '#2A2722' }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="label-caps text-white/25 mb-2">About This Brand</div>
            <p className="font-sans text-[13px] text-white/55 leading-relaxed">{brand.description}</p>
          </div>

          {/* Tags */}
          <div>
            <div className="label-caps text-white/25 mb-2">Content Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {brand.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] px-2.5 py-1 rounded-md"
                  style={{ background: '#1C1A17', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <div className="label-caps text-white/25 mb-2.5">Campaign Requirements</div>
            <div className="space-y-2">
              {brand.requirements.map((req, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="font-mono text-[10px] mt-0.5 shrink-0" style={{ color: '#EF4444' }}>→</span>
                  <span className="font-sans text-[12px] text-white/50 leading-relaxed">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Best for */}
          <div>
            <div className="label-caps text-white/25 mb-2">Best For</div>
            <div className="flex flex-wrap gap-2">
              {brand.bestFor.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 font-sans text-[11px] px-3 py-1.5 rounded-lg"
                  style={{ background: '#1C1A17', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span style={{ color: '#22C55E', fontSize: '9px' }}>✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-studio-brd flex items-center justify-between" style={{ background: '#141210' }}>
          <span className="font-sans text-[11px] text-white/25">
            Added {new Date(brand.addedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </span>
          <button
            onClick={onSave}
            className="flex items-center gap-2 font-sans text-[12px] font-medium px-4 py-2 rounded-xl border transition-all duration-200 hover:opacity-90"
            style={{
              background: isSaved ? 'rgba(245,166,83,0.1)' : '#1C1A17',
              color: isSaved ? '#F5A653' : 'rgba(255,255,255,0.5)',
              borderColor: isSaved ? 'rgba(245,166,83,0.3)' : 'rgba(255,255,255,0.1)',
            }}
          >
            <span>{isSaved ? '♥' : '♡'}</span>
            {isSaved ? 'Saved' : 'Save Brand'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────

export default function BrandDiscoveryPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all')
  const [activeSort, setActiveSort] = useState<SortOption>('match')
  const [savedIds, setSavedIds] = useState<Set<string>>(() => getSavedBrandIds())
  const [activeModal, setActiveModal] = useState<DiscoveryBrand | null>(null)

  const total = getTotalCount()

  const filteredBrands = useMemo(
    () => searchBrands(search, activeCategory, activeSort),
    [search, activeCategory, activeSort],
  )

  const handleSave = useCallback(
    (id: string) => setSavedIds((prev) => toggleSaveBrand(id, prev)),
    [],
  )

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">07 — Brand Discovery</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          {total}+ brands, analyzed. Find the ones that fit.
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2 max-w-md">
          Stop cold-pitching brands that aren&apos;t a fit. Surface partnerships where your content
          will naturally thrive — ranked by predicted performance.
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
      >
        {[
          { value: `${total}`, label: 'brands on platform' },
          { value: '94%',      label: 'prediction accuracy' },
          { value: '₹340',     label: 'avg. CPM increase'  },
          { value: savedIds.size > 0 ? String(savedIds.size) : '—', label: 'brands saved' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 border border-studio-brd"
            style={{ background: '#141210' }}
          >
            <div className="font-serif font-light text-display-s text-white leading-none">{s.value}</div>
            <div className="label-caps text-white/25 mt-2">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Main panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease }}
        className="rounded-2xl overflow-hidden border border-studio-brd"
        style={{ background: '#0F0E0B' }}
      >
        {/* Panel header */}
        <div className="px-6 py-4 border-b border-studio-brd flex items-center justify-between">
          <span className="label-caps text-white/30">Brand Discovery</span>
          <div className="flex items-center gap-3">
            <span className="font-sans text-[11px] text-ember-400/70">
              {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''} available
            </span>
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value as SortOption)}
              className="font-sans text-[11px] py-1.5 px-2.5 rounded-lg border border-studio-brd focus:outline-none transition-colors"
              style={{ background: '#141210', color: 'rgba(255,255,255,0.5)' }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-6 py-3.5 border-b border-studio-brd/50">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand name, category, or content type…"
            className="w-full max-w-sm font-sans text-[13px] text-white/70 placeholder-white/20 focus:outline-none py-1.5"
            style={{ background: 'transparent' }}
          />
        </div>

        {/* Category filter tabs */}
        <div className="px-4 py-3 border-b border-studio-brd/50 flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveCategory('all')}
            className="font-sans text-[11px] font-medium shrink-0 px-3 py-1.5 rounded-md transition-all duration-150"
            style={{
              background: activeCategory === 'all' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeCategory === 'all' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
            }}
          >
            All <span style={{ opacity: 0.4, fontSize: '9px', marginLeft: '2px' }}>{total}</span>
          </button>
          {CATEGORIES.map((cat) => {
            const count = searchBrands('', cat, 'match').length
            const isActive = activeCategory === cat
            const color = CATEGORY_COLORS[cat]
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="font-sans text-[11px] font-medium shrink-0 px-3 py-1.5 rounded-md transition-all duration-150"
                style={{
                  background: isActive ? color + '18' : 'transparent',
                  color: isActive ? color : 'rgba(255,255,255,0.3)',
                  border: isActive ? `1px solid ${color}30` : '1px solid transparent',
                }}
              >
                {cat} <span style={{ opacity: 0.4, fontSize: '9px', marginLeft: '2px' }}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Brand list */}
        <div className="p-4 space-y-2 min-h-[240px]">
          <AnimatePresence mode="popLayout">
            {filteredBrands.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-40"
              >
                <div className="text-center">
                  <div className="font-sans text-[13px] text-white/25 mb-1">No brands found</div>
                  <div className="font-sans text-[11px] text-white/15">Try a different search term or category</div>
                </div>
              </motion.div>
            ) : (
              filteredBrands.map((b, i) => {
                const score = b.compatibilityScore
                const color = scoreColor(score)
                const label = scoreLabel(score)
                const bars = Math.round(score / 10)
                const isSaved = savedIds.has(b.id)
                const catColor = CATEGORY_COLORS[b.category]
                const diffCfg = DIFFICULTY_CONFIG[b.difficulty]

                return (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.2), ease }}
                    className="relative flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer group transition-colors duration-150"
                    style={{ background: '#1C1A17' }}
                    onClick={() => setActiveModal(b)}
                  >
                    {/* Logo initial */}
                    <div
                      className="w-9 h-9 rounded-lg border border-studio-brd flex items-center justify-center shrink-0"
                      style={{ background: '#141210' }}
                    >
                      <span className="font-serif font-bold text-xs" style={{ color: catColor }}>{b.name[0]}</span>
                    </div>

                    {/* Middle: name + bars + budget */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="font-sans text-[13px] font-medium text-white/80 truncate">{b.name}</div>
                        <span
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded shrink-0"
                          style={{ color: catColor, background: catColor + '15' }}
                        >
                          {b.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 10 }).map((_, j) => (
                          <div
                            key={j}
                            className="h-1.5 w-3 rounded-full"
                            style={{ background: j < bars ? color + 'bb' : '#2A2722' }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-white/25">
                          {formatBudget(b.budgetMin, b.budgetMax)}
                        </span>
                        <span
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                          style={{ color: diffCfg.color, background: diffCfg.bg }}
                        >
                          {diffCfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Right: score + approval + save */}
                    <div className="text-right shrink-0 pr-7">
                      <div className="font-mono text-[13px] text-white/70 font-medium">{score}%</div>
                      <div className="label-caps mt-0.5" style={{ color: color + '80', fontSize: 9 }}>
                        {label}
                      </div>
                      <div className="font-sans text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {b.approvalRate}% approval
                      </div>
                    </div>

                    {/* Save button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSave(b.id) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150"
                      style={{
                        color: isSaved ? '#F5A653' : 'rgba(255,255,255,0.2)',
                        background: isSaved ? 'rgba(245,166,83,0.1)' : 'transparent',
                      }}
                    >
                      <span className="text-[14px]">{isSaved ? '♥' : '♡'}</span>
                    </button>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-studio-brd flex items-center justify-between">
          <span className="font-sans text-[11px] text-white/25">
            {total} brands · {savedIds.size} saved · updated daily
          </span>
          <span className="font-sans text-[11px] text-ember-400/50">Intent Brand Discovery</span>
        </div>
      </motion.div>

      {/* Brand modal */}
      <AnimatePresence>
        {activeModal && (
          <BrandModal
            brand={activeModal}
            isSaved={savedIds.has(activeModal.id)}
            onSave={() => handleSave(activeModal.id)}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
