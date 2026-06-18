import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { loadHistory, type ContentAnalysis } from '../services/rejectionPreventionService'
import {
  getSavedBrandIds,
  searchBrands,
  type DiscoveryBrand,
} from '../services/brandDiscoveryService'
import { loadMatchResult, type MatchResult } from '../services/creatorMatchService'
import { loadFeed, unreadCount, type FeedEvent } from '../services/livingBriefService'

// ── State shape ───────────────────────────────────────────────

interface CreatorStoreState {
  analysisHistory: ContentAnalysis[]
  savedBrandIds: Set<string>
  allBrands: DiscoveryBrand[]
  matchResult: MatchResult | null
  briefFeed: FeedEvent[]
  briefUnread: number
}

interface CreatorStoreContextValue extends CreatorStoreState {
  refreshAnalyses: () => void
  refreshSavedBrands: () => void
  refreshMatchResult: () => void
  refreshFeed: () => void
}

// ── Context ───────────────────────────────────────────────────

const CreatorStoreContext = createContext<CreatorStoreContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────

export function CreatorStoreProvider({ children }: { children: ReactNode }) {
  const [analysisHistory, setAnalysisHistory] = useState<ContentAnalysis[]>(() => loadHistory())
  const [savedBrandIds, setSavedBrandIds] = useState<Set<string>>(() => getSavedBrandIds())
  // allBrands is static (102 brands don't change at runtime)
  const [allBrands] = useState<DiscoveryBrand[]>(() => searchBrands('', 'all', 'match'))
  const [matchResult, setMatchResult] = useState<MatchResult | null>(() => loadMatchResult())
  const [briefFeed, setBriefFeed] = useState<FeedEvent[]>(() => loadFeed())

  const refreshAnalyses = useCallback(() => setAnalysisHistory(loadHistory()), [])
  const refreshSavedBrands = useCallback(() => setSavedBrandIds(getSavedBrandIds()), [])
  const refreshMatchResult = useCallback(() => setMatchResult(loadMatchResult()), [])
  const refreshFeed = useCallback(() => setBriefFeed(loadFeed()), [])

  // Services dispatch 'intent:store-updated' with a key after every write.
  // The context listens and re-hydrates only the affected slice.
  useEffect(() => {
    function handler(e: Event) {
      const key = (e as CustomEvent<string>).detail
      if (key === 'analyses') refreshAnalyses()
      else if (key === 'brands') refreshSavedBrands()
      else if (key === 'match') refreshMatchResult()
      else if (key === 'feed') refreshFeed()
    }
    window.addEventListener('intent:store-updated', handler)
    return () => window.removeEventListener('intent:store-updated', handler)
  }, [refreshAnalyses, refreshSavedBrands, refreshMatchResult, refreshFeed])

  return (
    <CreatorStoreContext.Provider
      value={{
        analysisHistory,
        savedBrandIds,
        allBrands,
        matchResult,
        briefFeed,
        briefUnread: unreadCount(briefFeed),
        refreshAnalyses,
        refreshSavedBrands,
        refreshMatchResult,
        refreshFeed,
      }}
    >
      {children}
    </CreatorStoreContext.Provider>
  )
}

// ── Hooks ─────────────────────────────────────────────────────

export function useCreatorStore(): CreatorStoreContextValue {
  const ctx = useContext(CreatorStoreContext)
  if (!ctx) throw new Error('useCreatorStore must be used within <CreatorStoreProvider>')
  return ctx
}

// Null-safe variant — returns null when no provider is present (e.g. brand portal)
export function useCreatorStoreOrNull(): CreatorStoreContextValue | null {
  return useContext(CreatorStoreContext)
}
