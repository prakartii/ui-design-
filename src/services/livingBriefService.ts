// ── Types ─────────────────────────────────────────────────────

export type FeedCategory = 'signal' | 'performance' | 'requirements' | 'tone'

export interface FeedEvent {
  id: string
  category: FeedCategory
  title: string
  detail: string
  metric?: string
  delta?: 'up' | 'down' | 'neutral'
  timestamp: string
  read: boolean
}

// ── Category display config ───────────────────────────────────

export const CATEGORY_CONFIG: Record<
  FeedCategory,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  signal: {
    label: 'Signal',
    color: '#F5A653',
    bg: 'rgba(245,166,83,0.1)',
    border: 'rgba(245,166,83,0.2)',
    icon: '◈',
  },
  performance: {
    label: 'Performance',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.2)',
    icon: '↗',
  },
  requirements: {
    label: 'Requirements',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.2)',
    icon: '⊡',
  },
  tone: {
    label: 'Tone Update',
    color: '#818CF8',
    bg: 'rgba(129,140,248,0.1)',
    border: 'rgba(129,140,248,0.2)',
    icon: '◎',
  },
}

// ── Event pools ───────────────────────────────────────────────

interface EventTemplate {
  title: string
  detail: string
  metric?: string
  delta?: FeedEvent['delta']
}

const POOLS: Record<FeedCategory, EventTemplate[]> = {
  performance: [
    {
      title: 'Outdoor content +34% CTR',
      detail:
        'Posts featuring outdoor settings are outperforming studio content by 34% on click-through this week.',
      metric: '+34%',
      delta: 'up',
    },
    {
      title: 'Watch time up to 47s average',
      detail:
        'Average viewer watch time increased from 31s to 47s. Hook retention is holding past the 3-second drop zone.',
      metric: '+47s',
      delta: 'up',
    },
    {
      title: 'Hook retention rate: 78%',
      detail:
        '78% of viewers reaching the 3-second mark, up from 61% last week. Current hook structure is outperforming.',
      metric: '78%',
      delta: 'up',
    },
    {
      title: 'Save rate hit 12.4%',
      detail:
        'Save rate jumped to 12.4% — 3x above the 4.2% category benchmark. Strong purchase-intent signal.',
      metric: '12.4%',
      delta: 'up',
    },
    {
      title: 'Comment sentiment 89% positive',
      detail:
        'Audience sentiment across 2,340 comments scored 89% positive. Brand mentions are appearing organically.',
      metric: '89%',
      delta: 'up',
    },
    {
      title: 'Shares per post up 28%',
      detail:
        'Share velocity increased 28% vs. last 7-day period. Challenge-format content is driving the spike.',
      metric: '+28%',
      delta: 'up',
    },
    {
      title: 'Profile visits from campaign +1.2K',
      detail:
        'Campaign-driven profile visits hit 1,240 this week — 3.2x the baseline before campaign launch.',
      metric: '+1.2K',
      delta: 'up',
    },
    {
      title: 'CTR dropped 8% on static posts',
      detail:
        'Static image posts showing 8% lower CTR vs. video. Brief guidance will be updated to video-only.',
      metric: '−8%',
      delta: 'down',
    },
    {
      title: 'Completion rate dipped to 54%',
      detail:
        'Average video completion fell to 54% — possible hook fatigue signal. Rotate your opening structure.',
      metric: '54%',
      delta: 'down',
    },
    {
      title: 'Engagement rate up 22%',
      detail:
        'Combined like + comment + save rate reached 6.8% this week, up 22% from campaign launch baseline.',
      metric: '+22%',
      delta: 'up',
    },
  ],

  signal: [
    {
      title: 'New approval pattern discovered',
      detail:
        'Analysis of last 12 approved posts found a shared pattern: creator-POV opening under 3s, immediate movement, no voiceover.',
    },
    {
      title: 'Algorithm shift detected',
      detail:
        'Platform distribution signals show preference for content under 45s with burnt-in subtitles. Brief updated accordingly.',
    },
    {
      title: 'Brand voice signals updated',
      detail:
        '3 new voice signals extracted from recently approved content. "Raw, unfiltered" framing is now top-weighted.',
    },
    {
      title: 'High-performing hook structure found',
      detail:
        'Question-open hooks ("Why does X always…") are converting 2.1× better than statement hooks this cycle.',
    },
    {
      title: 'Seasonal trend window opening',
      detail:
        'Trend velocity data shows a 72h high-shareability window for outdoor-morning content. Post within the window.',
    },
    {
      title: 'Competitor pattern flagged',
      detail:
        "A competing brand's creators are using challenge-format openers at 3× normal frequency. Differentiation opportunity.",
    },
    {
      title: 'Location tag increases saves 41%',
      detail:
        'Posts with a location visible in the first 2s are generating 41% more saves than non-location content.',
      metric: '+41%',
      delta: 'up',
    },
    {
      title: 'Approval rate forecast updated',
      detail:
        'Based on current brief alignment scores, estimated first-submission approval rate is 74% — highest since campaign launch.',
      metric: '74%',
      delta: 'up',
    },
  ],

  requirements: [
    {
      title: 'Brand updated campaign requirements',
      detail:
        'Brand has pushed a requirements update. Review the latest brief before your next submission to stay compliant.',
    },
    {
      title: 'Max video length: 90s → 60s',
      detail:
        'Brand shortened the maximum allowed video length from 90 to 60 seconds, effective immediately across all placements.',
    },
    {
      title: 'New disclosure: #BrandPartner required',
      detail:
        '#BrandPartner must now appear in the first 3 lines of every caption. Posts published before this update are grandfathered.',
    },
    {
      title: 'Banned phrases list expanded',
      detail:
        '2 new phrases added to the forbidden language list: "comfort" and "easy routine." Review the full guidelines.',
    },
    {
      title: 'CTA updated to "Tap to explore"',
      detail:
        'Mandatory call-to-action phrase updated from "Swipe up" to "Tap to explore" across all new placements.',
    },
    {
      title: 'Product must appear by second 8',
      detail:
        'New requirement: product must be visible within the first 8 seconds of every video. Applies to all future submissions.',
    },
    {
      title: 'No stock music — originals only',
      detail:
        'Brand removed permission for royalty-free library music. Only original audio or trending audio is now permitted.',
    },
    {
      title: 'Caption length cap: 150 characters',
      detail:
        'Brand is enforcing a 150-character caption limit to improve mobile readability. Long captions will be flagged.',
    },
  ],

  tone: [
    {
      title: 'Creator notifications sent',
      detail:
        'All active creators on this campaign have been notified of the latest brief changes via the platform.',
    },
    {
      title: 'Tone shift: more aspirational',
      detail:
        'Approved content analysis shows a shift toward aspirational framing. "I could" language is being replaced by "I did."',
    },
    {
      title: '"Raw and unfiltered" style approved',
      detail:
        'Brand explicitly approved lower-production, creator-authentic style. HD b-roll requirement has been dropped.',
    },
    {
      title: 'Emotional register: confidence over comfort',
      detail:
        'Replace "easy" and "relaxed" framing with "earned" and "capable." Comfort language is the #1 rejection trigger.',
    },
    {
      title: 'Narrative arc: challenge → win',
      detail:
        'Brand approved content showing physical or mental challenge being overcome. Passive "I use X" stories are being rejected.',
    },
    {
      title: 'Product-first opening removed',
      detail:
        'Product-first opening tone removed from approved examples. Creator story must precede the product reveal in every video.',
    },
    {
      title: 'Optimal post times updated',
      detail:
        'Brand recommends 6–8am or 7–9pm local time for this campaign based on latest audience activity data.',
    },
    {
      title: 'Voiceover now flagged as low-trust',
      detail:
        'Brand analysis shows voiceover content receiving 38% lower approval rates. Creator\'s own voice is strongly preferred.',
      metric: '−38%',
      delta: 'down',
    },
  ],
}

// ── Generator ─────────────────────────────────────────────────

const CATEGORIES: FeedCategory[] = ['signal', 'performance', 'requirements', 'tone']

export function generateEvent(): FeedEvent {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
  const pool = POOLS[category]
  const template = pool[Math.floor(Math.random() * pool.length)]
  return {
    id: crypto.randomUUID(),
    category,
    ...template,
    timestamp: new Date().toISOString(),
    read: false,
  }
}

export function nextDelay(): number {
  return Math.floor(Math.random() * (15000 - 8000 + 1)) + 8000
}

// ── Persistence ───────────────────────────────────────────────

const FEED_KEY = 'intent_living_brief_feed'
const MAX_EVENTS = 80

export function loadFeed(): FeedEvent[] {
  try {
    const raw = localStorage.getItem(FEED_KEY)
    return raw ? (JSON.parse(raw) as FeedEvent[]) : []
  } catch {
    return []
  }
}

export function saveFeed(events: FeedEvent[]): void {
  try {
    localStorage.setItem(FEED_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)))
    window.dispatchEvent(new CustomEvent('intent:store-updated', { detail: 'feed' }))
  } catch {
    // ignore storage errors
  }
}

// ── Pure state helpers ────────────────────────────────────────

export function appendEvent(event: FeedEvent, existing: FeedEvent[]): FeedEvent[] {
  return [event, ...existing].slice(0, MAX_EVENTS)
}

export function markRead(id: string, events: FeedEvent[]): FeedEvent[] {
  return events.map((e) => (e.id === id ? { ...e, read: true } : e))
}

export function markAllRead(events: FeedEvent[]): FeedEvent[] {
  return events.map((e) => ({ ...e, read: true }))
}

export function clearFeed(): FeedEvent[] {
  return []
}

export function unreadCount(events: FeedEvent[]): number {
  return events.filter((e) => !e.read).length
}
