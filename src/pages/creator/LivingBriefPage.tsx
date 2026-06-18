import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCampaigns } from '../../hooks/useCampaigns'
import {
  generateEvent,
  loadFeed,
  saveFeed,
  appendEvent,
  markRead,
  markAllRead,
  clearFeed,
  unreadCount,
  nextDelay,
  CATEGORY_CONFIG,
  type FeedEvent,
  type FeedCategory,
} from '../../services/livingBriefService'

const ease = [0.16, 1, 0.3, 1] as const

const SIGNAL_COLORS: Record<string, string> = {
  new: '#EF4444',
  update: '#F5A653',
  alert: '#EAB308',
}

// ── Relative timestamp ────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 15) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

// ── Feed event card ───────────────────────────────────────────

function FeedEventCard({
  event,
  tick,
  onRead,
}: {
  event: FeedEvent
  tick: number
  onRead: () => void
}) {
  const cfg = CATEGORY_CONFIG[event.category]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.38, ease }}
      onClick={!event.read ? onRead : undefined}
      className="relative flex gap-3 px-4 py-3.5 border-b transition-colors duration-150"
      style={{
        borderColor: 'rgba(255,255,255,0.05)',
        cursor: event.read ? 'default' : 'pointer',
        background: event.read ? 'transparent' : 'rgba(255,255,255,0.015)',
      }}
    >
      {/* Category icon */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <span style={{ color: cfg.color, fontSize: '11px', lineHeight: 1 }}>{cfg.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p
            className="font-sans text-[12px] font-medium leading-snug"
            style={{ color: event.read ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.82)' }}
          >
            {event.title}
          </p>
          {event.metric && (
            <span
              className="font-mono text-[10px] shrink-0 px-1.5 py-0.5 rounded"
              style={{
                color: event.delta === 'down' ? '#F87171' : cfg.color,
                background:
                  event.delta === 'down' ? 'rgba(239,68,68,0.1)' : cfg.bg,
              }}
            >
              {event.metric}
            </span>
          )}
        </div>
        <p
          className="font-sans text-[11px] leading-[1.65] line-clamp-2"
          style={{ color: 'rgba(255,255,255,0.28)' }}
        >
          {event.detail}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span
            className="font-mono text-[9px] px-1.5 py-0.5 rounded capitalize"
            style={{ color: cfg.color + 'aa', background: cfg.bg }}
          >
            {cfg.label}
          </span>
          {/* tick is consumed here so TS doesn't warn about unused var */}
          <span
            className="font-mono text-[10px]"
            style={{ color: 'rgba(255,255,255,0.18)' }}
            data-tick={tick}
          >
            {relativeTime(event.timestamp)}
          </span>
        </div>
      </div>

      {/* Unread dot */}
      <AnimatePresence>
        {!event.read && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-3 top-3.5 w-1.5 h-1.5 rounded-full"
            style={{ background: cfg.color }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Activity feed panel ───────────────────────────────────────

type FilterOption = 'all' | FeedCategory

function ActivityFeedPanel() {
  const [feed, setFeed] = useState<FeedEvent[]>(() => loadFeed())
  const [filter, setFilter] = useState<FilterOption>('all')
  const [isPaused, setIsPaused] = useState(false)
  const [tick, setTick] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Persist to localStorage whenever feed changes
  useEffect(() => {
    saveFeed(feed)
  }, [feed])

  // Tick every 30s to refresh relative timestamps
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 30000)
    return () => clearInterval(t)
  }, [])

  // Auto-generate events when live
  const scheduleNext = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setFeed((prev) => appendEvent(generateEvent(), prev))
      scheduleNext()
    }, nextDelay())
  }, [])

  useEffect(() => {
    if (isPaused) return
    scheduleNext()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isPaused, scheduleNext])

  const handleRead = useCallback((id: string) => {
    setFeed((prev) => markRead(id, prev))
  }, [])

  const handleMarkAllRead = useCallback(() => {
    setFeed((prev) => markAllRead(prev))
  }, [])

  const handleClear = useCallback(() => {
    setFeed(clearFeed())
  }, [])

  const badge = unreadCount(feed)

  const FILTERS: { key: FilterOption; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'signal', label: 'Signals' },
    { key: 'performance', label: 'Performance' },
    { key: 'requirements', label: 'Requirements' },
    { key: 'tone', label: 'Tone' },
  ]

  const filtered =
    filter === 'all' ? feed : feed.filter((e) => e.category === filter)

  const filterCount = (key: FilterOption) =>
    key === 'all' ? feed.length : feed.filter((e) => e.category === key).length

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease }}
      className="rounded-2xl overflow-hidden border border-studio-brd"
      style={{ background: '#0F0E0B' }}
    >
      {/* Panel header */}
      <div
        className="px-4 py-3 border-b border-studio-brd flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <span className="label-caps text-white/35">Intelligence Feed</span>
          {badge > 0 && (
            <motion.span
              key={badge}
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, type: 'spring' }}
              className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: '#EF4444',
                color: '#fff',
                minWidth: '18px',
                textAlign: 'center',
              }}
            >
              {badge > 99 ? '99+' : badge}
            </motion.span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {badge > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="font-sans text-[10px] text-white/25 hover:text-white/50 transition-colors"
            >
              Mark read
            </button>
          )}
          {feed.length > 0 && (
            <button
              onClick={handleClear}
              className="font-sans text-[10px] text-white/20 hover:text-white/40 transition-colors"
            >
              Clear
            </button>
          )}

          {/* Pause / Live toggle */}
          <button
            onClick={() => setIsPaused((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all duration-200"
            style={{
              background: isPaused
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(34,197,94,0.07)',
              borderColor: isPaused
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(34,197,94,0.2)',
            }}
          >
            <div className="relative w-1.5 h-1.5 shrink-0">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isPaused ? 'rgba(255,255,255,0.25)' : '#22C55E',
                }}
              />
              {!isPaused && (
                <div
                  className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-60"
                />
              )}
            </div>
            <span
              className="font-sans text-[10px] font-medium"
              style={{
                color: isPaused ? 'rgba(255,255,255,0.3)' : '#22C55E',
              }}
            >
              {isPaused ? 'Paused' : 'Live'}
            </span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        className="px-3 py-2 border-b border-studio-brd flex items-center gap-0.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {FILTERS.map(({ key, label }) => {
          const isActive = filter === key
          const count = filterCount(key)
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="font-sans text-[10px] font-medium shrink-0 px-2.5 py-1.5 rounded-md transition-all duration-150 whitespace-nowrap"
              style={{
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
              }}
            >
              {label}
              {count > 0 && (
                <span
                  className="ml-1 font-mono"
                  style={{ opacity: 0.45, fontSize: '9px' }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Feed list */}
      <div className="overflow-y-auto" style={{ maxHeight: '520px' }}>
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-14 px-6 text-center"
            >
              <div
                className="font-mono text-3xl mb-3"
                style={{ color: 'rgba(255,255,255,0.06)' }}
              >
                ◌
              </div>
              <p className="font-sans text-[12px] text-white/25">
                {isPaused
                  ? 'Feed paused — resume to receive updates'
                  : 'Waiting for campaign signals…'}
              </p>
            </motion.div>
          ) : (
            filtered.map((event) => (
              <FeedEventCard
                key={event.id}
                event={event}
                tick={tick}
                onRead={() => handleRead(event.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Feed footer */}
      {filtered.length > 0 && (
        <div
          className="px-4 py-2.5 border-t border-studio-brd flex items-center justify-between"
        >
          <span className="font-mono text-[10px] text-white/20">
            {feed.length} event{feed.length !== 1 ? 's' : ''} stored
          </span>
          <span className="font-mono text-[10px] text-white/15">
            Updates every 8–15s
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────

export default function LivingBriefPage() {
  const { livingBriefs, loading } = useCampaigns()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (livingBriefs.length > 0 && !selectedId) {
      setSelectedId(livingBriefs[0].id)
    }
  }, [livingBriefs, selectedId])

  useEffect(() => {
    const t = setInterval(() => setTick((c) => c + 1), 4000)
    return () => clearInterval(t)
  }, [])

  const selected = livingBriefs.find((b) => b.id === selectedId) ?? livingBriefs[0]

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <span className="label-caps text-ember-400/60">05 — Living Brief</span>
        <h1 className="font-serif font-light text-display-s text-white mt-2 leading-tight">
          Briefs that breathe with the campaign.
        </h1>
        <p className="font-sans text-[14px] text-white/35 mt-2 max-w-md">
          Campaign requirements don&apos;t stay still. The Living Brief updates in real time — so your
          second video benefits from signals your first video generated.
        </p>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* ── Left column: existing brief content ── */}
        <div>
          {loading && (
            <div className="rounded-2xl p-12 border border-dashed border-studio-brd/50 text-center mb-6">
              <span className="font-sans text-[14px] text-white/25">Loading live briefs…</span>
            </div>
          )}

          {!loading && livingBriefs.length === 0 && (
            <div className="rounded-2xl p-12 border border-dashed border-studio-brd/50 text-center mb-6">
              <span className="font-sans text-[14px] text-white/25">No active briefs at the moment.</span>
            </div>
          )}

          {!loading && livingBriefs.length > 0 && (
            <>
              <div className="flex gap-2 mb-6 flex-wrap">
                {livingBriefs.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-sans text-[12px] font-medium transition-all duration-150 ${
                      selectedId === b.id
                        ? 'border-ember-600/40 text-white'
                        : 'border-studio-brd text-white/40 hover:text-white/70'
                    }`}
                    style={{ background: selectedId === b.id ? 'rgba(217,124,40,0.06)' : '#141210' }}
                  >
                    <div className="relative shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
                    </div>
                    <span className="capitalize">{b.signal_type}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {selected && (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="rounded-2xl overflow-hidden border border-studio-brd mb-6"
                    style={{ background: '#0F0E0B' }}
                  >
                    <div className="px-6 py-4 border-b border-studio-brd flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
                        </div>
                        <span className="label-caps text-emerald-400/80">Live</span>
                        <span
                          className="label-caps"
                          style={{ color: SIGNAL_COLORS[selected.signal_type] + '99', fontSize: 9 }}
                        >
                          {selected.signal_type.toUpperCase()}
                        </span>
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={tick}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="font-sans text-[11px] text-white/25"
                        >
                          ↺ Just updated
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    <div className="px-6 py-4 border-b border-studio-brd/50" style={{ background: 'rgba(28,26,23,0.3)' }}>
                      <div className="font-sans text-[12px] text-white/30 mt-0.5">
                        Active campaign signal
                      </div>
                    </div>

                    <div className="p-5">
                      <div
                        className="rounded-xl p-4 border border-studio-brd/50"
                        style={{ background: 'rgba(28,26,23,0.3)' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: SIGNAL_COLORS[selected.signal_type] }}
                            />
                            <span
                              className="label-caps"
                              style={{ color: (SIGNAL_COLORS[selected.signal_type] ?? '#888') + '99', fontSize: 9 }}
                            >
                              {selected.signal_type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <p className="font-sans text-[12px] text-white/50 leading-relaxed">
                          {selected.description}
                        </p>
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mx-5 mb-5 rounded-xl p-4 border border-studio-brd/50"
                    >
                      <div className="label-caps text-white/20 mb-3">Core requirements (unchanged)</div>
                      <div className="flex flex-wrap gap-2">
                        {["Creator's own voice", 'Open with motion', 'No voiceover', 'No promo codes', '60s max'].map(
                          (req) => (
                            <span
                              key={req}
                              className="font-sans text-[11px] text-white/35 px-2.5 py-1 rounded-md"
                              style={{ background: '#1C1A17' }}
                            >
                              {req}
                            </span>
                          ),
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Feature grid */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
            className="grid sm:grid-cols-2 gap-3"
          >
            {[
              'Real-time campaign performance signals',
              'Automatic requirement updates from brand data',
              'Creator notification on every brief change',
              'History of all updates with reasoning',
            ].map((feat) => (
              <div
                key={feat}
                className="flex items-start gap-3 rounded-xl px-4 py-3.5 border border-studio-brd"
                style={{ background: '#141210' }}
              >
                <span className="text-emerald-400 mt-0.5 shrink-0 text-sm">↗</span>
                <span className="font-sans text-[13px] text-white/50">{feat}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right column: activity feed ── */}
        <ActivityFeedPanel />
      </div>
    </div>
  )
}
