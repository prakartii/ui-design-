import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreatorStoreOrNull } from '../context/CreatorStoreContext'
import {
  buildIndex,
  searchAll,
  groupResults,
  loadRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  formatTimeAgo,
  QUICK_ACTIONS,
  TYPE_CONFIG,
  type SearchResult,
  type RecentSearch,
} from '../services/searchService'

const ease = [0.16, 1, 0.3, 1] as const

// ── Result row ────────────────────────────────────────────────

function ResultRow({
  result,
  isActive,
  rowRef,
  onClick,
}: {
  result: SearchResult
  isActive: boolean
  rowRef?: (el: HTMLDivElement | null) => void
  onClick: () => void
}) {
  const cfg = TYPE_CONFIG[result.type]
  return (
    <div
      ref={rowRef}
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors duration-75"
      style={{ background: isActive ? '#1C1A17' : 'transparent' }}
    >
      <span
        className="font-mono text-[13px] w-5 shrink-0 text-center"
        style={{ color: cfg.color }}
      >
        {result.icon}
      </span>

      <div className="flex-1 min-w-0">
        <div
          className="font-sans text-[13px] leading-tight"
          style={{ color: isActive ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.7)' }}
        >
          {result.title}
        </div>
        {result.subtitle && (
          <div className="font-sans text-[11px] text-white/30 mt-0.5 truncate">
            {result.subtitle}
          </div>
        )}
      </div>

      {result.meta && (
        <span
          className="font-mono text-[9px] px-2 py-0.5 rounded shrink-0"
          style={{ color: cfg.color, background: cfg.color + '18' }}
        >
          {result.meta}
        </span>
      )}

      <span
        className="font-sans text-[12px] shrink-0 transition-colors duration-75"
        style={{ color: isActive ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.12)' }}
      >
        →
      </span>
    </div>
  )
}

// ── Recent search row ─────────────────────────────────────────

function RecentRow({
  recent,
  isActive,
  rowRef,
  onClick,
}: {
  recent: RecentSearch
  isActive: boolean
  rowRef?: (el: HTMLDivElement | null) => void
  onClick: () => void
}) {
  return (
    <div
      ref={rowRef}
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors duration-75"
      style={{ background: isActive ? '#1C1A17' : 'transparent' }}
    >
      <span className="font-mono text-[13px] w-5 shrink-0 text-center text-white/20">↺</span>
      <span
        className="font-sans text-[13px] flex-1"
        style={{ color: isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)' }}
      >
        {recent.query}
      </span>
      <span className="font-sans text-[10px] text-white/15 shrink-0">
        {formatTimeAgo(recent.timestamp)}
      </span>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-5 py-2 border-b sticky top-0"
      style={{ background: '#0F0E0B', borderColor: 'rgba(42,39,34,0.4)' }}
    >
      <span className="label-caps text-white/20" style={{ fontSize: '9px', letterSpacing: '0.12em' }}>
        {children}
      </span>
    </div>
  )
}

// ── Keyboard key badge ────────────────────────────────────────

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="font-mono text-[9px] text-white/20 px-1.5 py-0.5 rounded"
      style={{ border: '1px solid rgba(42,39,34,0.6)', background: '#141210' }}
    >
      {children}
    </kbd>
  )
}

// ── Main palette ──────────────────────────────────────────────

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const store = useCreatorStoreOrNull()

  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [recent, setRecent] = useState<RecentSearch[]>(() => loadRecentSearches())

  const inputRef = useRef<HTMLInputElement>(null)
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // ── Index & search ─────────────────────────────────────────

  const index = useMemo(
    () => (store ? buildIndex(store) : [...QUICK_ACTIONS]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      store?.analysisHistory,
      store?.allBrands,
      store?.matchResult,
      store?.briefFeed,
    ],
  )

  const results = useMemo(() => searchAll(query, index), [query, index])
  const groups = useMemo(() => groupResults(results), [results])

  // ── Flat nav list ──────────────────────────────────────────
  // In empty state: quick actions then recent searches.
  // In search state: flat results in order.

  const totalItems = query.trim()
    ? results.length
    : QUICK_ACTIONS.length + recent.length

  // ── Reset on open ──────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIdx(0)
      setRecent(loadRecentSearches())
      rowRefs.current = {}
      // Defer focus so the element is mounted
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  // ── Scroll active row into view ────────────────────────────

  useEffect(() => {
    rowRefs.current[activeIdx]?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  // ── Actions ────────────────────────────────────────────────

  const openResult = useCallback(
    (result: SearchResult) => {
      if (!result.path) return
      const updated = saveRecentSearch(query || result.title)
      setRecent(updated)
      navigate(result.path)
      onClose()
    },
    [navigate, onClose, query],
  )

  const activateItem = useCallback(
    (idx: number) => {
      if (query.trim()) {
        const result = results[idx]
        if (result) openResult(result)
      } else {
        if (idx < QUICK_ACTIONS.length) {
          openResult(QUICK_ACTIONS[idx])
        } else {
          const recentItem = recent[idx - QUICK_ACTIONS.length]
          if (recentItem) {
            setQuery(recentItem.query)
            setActiveIdx(0)
          }
        }
      }
    },
    [query, results, recent, openResult],
  )

  // ── Keyboard inside palette ────────────────────────────────

  useEffect(() => {
    if (!isOpen) return

    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, totalItems - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Home') {
        e.preventDefault()
        setActiveIdx(0)
        return
      }
      if (e.key === 'End') {
        e.preventDefault()
        setActiveIdx(Math.max(0, totalItems - 1))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        activateItem(activeIdx)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, activeIdx, totalItems, activateItem, onClose])

  // ── Input change ───────────────────────────────────────────

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setActiveIdx(0)
  }

  function handleInputKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    // Let arrow keys propagate to the global handler, prevent default cursor movement
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') e.preventDefault()
  }

  function handleClear() {
    setQuery('')
    setActiveIdx(0)
    inputRef.current?.focus()
  }

  // ── Ref callback helper ────────────────────────────────────

  function setRowRef(idx: number) {
    return (el: HTMLDivElement | null) => {
      rowRefs.current[idx] = el
    }
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <div className="fixed inset-0 z-[201] flex items-start justify-center px-4 pt-[13vh] pointer-events-none">
            <motion.div
              key="palette-panel"
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.18, ease }}
              className="w-full max-w-[590px] rounded-2xl border border-studio-brd overflow-hidden pointer-events-auto"
              style={{
                background: '#0F0E0B',
                boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(42,39,34,0.8)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '72vh',
              }}
            >
              {/* Search input row */}
              <div
                className="px-5 py-4 flex items-center gap-3 shrink-0 border-b border-studio-brd"
              >
                <span className="font-mono text-[15px] text-white/20 shrink-0 select-none">⌘</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search brands, analyses, matches, reports…"
                  className="flex-1 bg-transparent font-sans text-[14px] text-white outline-none"
                  style={{ caretColor: '#F5A653' }}
                  spellCheck={false}
                  autoComplete="off"
                />
                <div className="flex items-center gap-2 shrink-0">
                  {query && (
                    <button
                      onClick={handleClear}
                      className="font-sans text-[12px] text-white/20 hover:text-white/50 transition-colors leading-none"
                    >
                      ✕
                    </button>
                  )}
                  <Kbd>ESC</Kbd>
                </div>
              </div>

              {/* Results area */}
              <div className="flex-1 overflow-y-auto">

                {/* ── Search results ── */}
                {query.trim() ? (
                  results.length === 0 ? (
                    <div className="px-5 py-14 text-center">
                      <div className="font-sans text-[13px] text-white/20 mb-2">
                        No results for &ldquo;{query}&rdquo;
                      </div>
                      <div className="font-sans text-[11px] text-white/12">
                        Try searching for a brand name, content type, or action
                      </div>
                    </div>
                  ) : (
                    <>
                      {groups.map((group) =>
                        group.results.length === 0 ? null : (
                          <div key={group.label}>
                            <SectionLabel>{group.label}</SectionLabel>
                            {group.results.map((result) => {
                              const flatIdx = results.indexOf(result)
                              return (
                                <ResultRow
                                  key={result.id}
                                  result={result}
                                  isActive={flatIdx === activeIdx}
                                  rowRef={setRowRef(flatIdx)}
                                  onClick={() => openResult(result)}
                                />
                              )
                            })}
                          </div>
                        ),
                      )}
                    </>
                  )
                ) : (
                  /* ── Empty state ── */
                  <>
                    {/* Recent searches */}
                    {recent.length > 0 && (
                      <div>
                        <div
                          className="px-5 py-2 flex items-center justify-between border-b sticky top-0"
                          style={{ background: '#0F0E0B', borderColor: 'rgba(42,39,34,0.4)' }}
                        >
                          <span
                            className="label-caps text-white/20"
                            style={{ fontSize: '9px', letterSpacing: '0.12em' }}
                          >
                            Recent Searches
                          </span>
                          <button
                            onClick={() => {
                              clearRecentSearches()
                              setRecent([])
                            }}
                            className="font-sans text-[9px] text-white/15 hover:text-white/40 transition-colors"
                          >
                            Clear all
                          </button>
                        </div>
                        {recent.map((r, i) => {
                          const flatIdx = QUICK_ACTIONS.length + i
                          return (
                            <RecentRow
                              key={r.query + i}
                              recent={r}
                              isActive={flatIdx === activeIdx}
                              rowRef={setRowRef(flatIdx)}
                              onClick={() => {
                                setQuery(r.query)
                                setActiveIdx(0)
                              }}
                            />
                          )
                        })}
                      </div>
                    )}

                    {/* Quick actions */}
                    <div>
                      <SectionLabel>Quick Actions</SectionLabel>
                      {QUICK_ACTIONS.map((action, i) => (
                        <ResultRow
                          key={action.id}
                          result={action}
                          isActive={i === activeIdx}
                          rowRef={setRowRef(i)}
                          onClick={() => openResult(action)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div
                className="px-5 py-3 border-t border-studio-brd flex items-center justify-between shrink-0"
                style={{ background: '#0A0908' }}
              >
                <div className="flex items-center gap-5">
                  {[
                    { key: '↑↓', label: 'navigate' },
                    { key: '↵', label: 'open' },
                    { key: 'esc', label: 'close' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <Kbd>{key}</Kbd>
                      <span className="font-sans text-[10px] text-white/18">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {query.trim() && (
                    <span className="font-sans text-[10px] text-white/18">
                      {results.length} result{results.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-400/60" />
                    <span className="font-sans text-[10px] text-white/18">intent search</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
