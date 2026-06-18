import type { ContentAnalysis } from './rejectionPreventionService'
import type { DiscoveryBrand } from './brandDiscoveryService'
import type { MatchResult } from './creatorMatchService'
import type { FeedEvent } from './livingBriefService'

// ── Types ─────────────────────────────────────────────────────

export type SearchResultType = 'action' | 'brand' | 'analysis' | 'match' | 'feed'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle?: string
  meta?: string
  icon: string
  path: string
  keywords?: string[]
}

export interface SearchGroup {
  label: string
  results: SearchResult[]
}

export interface RecentSearch {
  query: string
  timestamp: string
}

// ── Type display config ───────────────────────────────────────

export const TYPE_CONFIG: Record<
  SearchResultType,
  { label: string; color: string; groupLabel: string }
> = {
  action:   { label: 'Action',          color: '#F5A653', groupLabel: 'Quick Actions'      },
  brand:    { label: 'Brand',           color: '#34D399', groupLabel: 'Brands'             },
  analysis: { label: 'Risk Report',     color: '#EF4444', groupLabel: 'Risk Reports'       },
  match:    { label: 'Brand Match',     color: '#818CF8', groupLabel: 'Brand Matches'      },
  feed:     { label: 'Brief Update',    color: '#22C55E', groupLabel: 'Brief Intelligence' },
}

const GROUP_ORDER: SearchResultType[] = ['action', 'match', 'brand', 'analysis', 'feed']

// ── Quick actions (static) ────────────────────────────────────

export const QUICK_ACTIONS: SearchResult[] = [
  {
    id: 'qa-dashboard',
    type: 'action',
    title: 'Go to Dashboard',
    subtitle: 'Command center overview',
    icon: '◈',
    path: '/creator/dashboard',
    keywords: ['home', 'command center', 'overview'],
  },
  {
    id: 'qa-voice',
    type: 'action',
    title: 'Open Voice Archaeology',
    subtitle: 'Decode brand DNA from analyzed campaigns',
    icon: '◉',
    path: '/creator/voice-archaeology',
    keywords: ['brand dna', 'patterns', 'analyze', 'decode'],
  },
  {
    id: 'qa-brief',
    type: 'action',
    title: 'Open Brief Translator',
    subtitle: 'Turn vague briefs into creative direction',
    icon: '⇄',
    path: '/creator/brief-translator',
    keywords: ['translate', 'creative direction', 'brief'],
  },
  {
    id: 'qa-match',
    type: 'action',
    title: 'Open Creator Match',
    subtitle: 'Find brands your voice was made for',
    icon: '◎',
    path: '/creator/creator-match',
    keywords: ['brands', 'match', 'voice', 'compatibility', 'recommendation'],
  },
  {
    id: 'qa-rejection',
    type: 'action',
    title: 'Open Rejection Prevention',
    subtitle: 'Review your script before you submit',
    icon: '⬡',
    path: '/creator/rejection-prevention',
    keywords: ['review', 'script', 'risk', 'caption', 'content', 'approval'],
  },
  {
    id: 'qa-living',
    type: 'action',
    title: 'Open Living Brief',
    subtitle: 'Real-time campaign intelligence feed',
    icon: '↗',
    path: '/creator/living-brief',
    keywords: ['feed', 'intelligence', 'signals', 'live', 'real-time'],
  },
  {
    id: 'qa-discovery',
    type: 'action',
    title: 'Go to Brand Discovery',
    subtitle: 'Surface partnerships where your voice fits',
    icon: '⊕',
    path: '/creator/brand-discovery',
    keywords: ['brands', 'search', 'discover', 'partnership', 'browse'],
  },
  {
    id: 'qa-pixel',
    type: 'action',
    title: 'Open Pixel Pact',
    subtitle: 'Smart contracts that verify and release payment',
    icon: '⬢',
    path: '/creator/pixel-pact',
    keywords: ['contract', 'payment', 'smart contract', 'pact'],
  },
]

// ── Store snapshot (matches CreatorStoreContext shape) ────────

export interface StoreSnapshot {
  analysisHistory: ContentAnalysis[]
  allBrands: DiscoveryBrand[]
  savedBrandIds: Set<string>
  matchResult: MatchResult | null
  briefFeed: FeedEvent[]
}

// ── Index builder ─────────────────────────────────────────────

export function buildIndex(store: StoreSnapshot): SearchResult[] {
  const results: SearchResult[] = [...QUICK_ACTIONS]

  // All 102 brands
  for (const b of store.allBrands) {
    results.push({
      id: `brand-${b.id}`,
      type: 'brand',
      title: b.name,
      subtitle: `${b.category} · ${b.difficulty}`,
      meta: `${b.compatibilityScore}% match`,
      icon: '⊕',
      path: '/creator/brand-discovery',
      keywords: [...b.tags, b.category.toLowerCase(), b.difficulty, b.description],
    })
  }

  // Risk analyses
  for (const a of store.analysisHistory) {
    const critCount = a.issues.filter((i) => i.level === 'critical').length
    results.push({
      id: `analysis-${a.id}`,
      type: 'analysis',
      title: a.contentSnippet.slice(0, 55) + (a.contentSnippet.length > 55 ? '…' : ''),
      subtitle: `${a.contentType} · Risk ${a.riskScore}/100`,
      meta: critCount > 0 ? `${critCount} critical` : `${a.approvalProbability}% approval`,
      icon: '⬡',
      path: '/creator/rejection-prevention',
      keywords: [a.contentType, 'risk', 'script', 'caption', 'concept', 'review', 'approval'],
    })
  }

  // Brand matches from last match run
  if (store.matchResult) {
    for (const m of store.matchResult.matches) {
      results.push({
        id: `match-${m.brandId}`,
        type: 'match',
        title: m.brandName,
        subtitle: `${m.brandCategory} · ${m.approvalRate}% approval`,
        meta: `${m.compatibilityScore}% compat.`,
        icon: '◎',
        path: '/creator/creator-match',
        keywords: [m.brandCategory.toLowerCase(), 'match', 'compatibility', 'earnings', m.brandName.toLowerCase()],
      })
    }
  }

  // Brief feed (most recent 25 events)
  for (const e of store.briefFeed.slice(0, 25)) {
    results.push({
      id: `feed-${e.id}`,
      type: 'feed',
      title: e.title,
      subtitle: e.detail.length > 65 ? e.detail.slice(0, 65) + '…' : e.detail,
      meta: e.metric ?? undefined,
      icon: '↗',
      path: '/creator/living-brief',
      keywords: [e.category, 'signal', 'performance', 'intelligence', 'brief'],
    })
  }

  return results
}

// ── Search logic ──────────────────────────────────────────────

function scoreField(field: string, query: string): number {
  const f = field.toLowerCase()
  const q = query.toLowerCase()
  if (f === q) return 100
  if (f.startsWith(q)) return 80
  if (f.includes(q)) return 55
  return 0
}

function scoreResult(result: SearchResult, query: string): number {
  let best = scoreField(result.title, query)
  if (result.subtitle) best = Math.max(best, scoreField(result.subtitle, query) * 0.75)
  if (result.meta) best = Math.max(best, scoreField(result.meta, query) * 0.55)
  for (const kw of result.keywords ?? []) {
    best = Math.max(best, scoreField(kw, query) * 0.65)
  }
  return best
}

export function searchAll(query: string, index: SearchResult[]): SearchResult[] {
  const q = query.trim()
  if (!q) return []
  return index
    .map((r) => ({ r, s: scoreResult(r, q) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .map(({ r }) => r)
    .slice(0, 30)
}

export function groupResults(results: SearchResult[]): SearchGroup[] {
  const map: Partial<Record<SearchResultType, SearchResult[]>> = {}
  for (const r of results) {
    if (!map[r.type]) map[r.type] = []
    map[r.type]!.push(r)
  }
  const groups: SearchGroup[] = []
  for (const type of GROUP_ORDER) {
    const items = map[type]
    if (items && items.length > 0) {
      groups.push({ label: TYPE_CONFIG[type].groupLabel, results: items.slice(0, 8) })
    }
  }
  return groups
}

// ── Recent searches ───────────────────────────────────────────

const RECENT_KEY = 'intent_search_history'
const MAX_RECENT = 8

export function loadRecentSearches(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as RecentSearch[]) : []
  } catch {
    return []
  }
}

export function saveRecentSearch(query: string): RecentSearch[] {
  const q = query.trim()
  if (q.length < 2) return loadRecentSearches()
  const existing = loadRecentSearches().filter((r) => r.query !== q)
  const updated = [{ query: q, timestamp: new Date().toISOString() }, ...existing].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  return updated
}

export function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_KEY)
}

// ── Time formatting ───────────────────────────────────────────

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
