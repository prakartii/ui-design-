import {
  searchBrands,
  DIFFICULTY_CONFIG,
  type DiscoveryBrand,
  type BrandDifficulty,
} from './brandDiscoveryService'

// ── Types ─────────────────────────────────────────────────────

export type FollowerTier = 'nano' | 'micro' | 'mid' | 'macro'

export interface CreatorProfile {
  niche: string
  followers: number
  contentStyle: string
  platform: string
}

export interface VoiceTrait {
  trait: string
  score: number
}

export interface BrandMatch {
  brandId: string
  brandName: string
  brandCategory: string
  compatibilityScore: number
  approvalRate: number
  earningsMin: number
  earningsMax: number
  difficulty: BrandDifficulty
  reasons: string[]
}

export interface MatchResult {
  profile: CreatorProfile
  voiceSignature: VoiceTrait[]
  matches: BrandMatch[]
  generatedAt: string
}

// ── Constants ─────────────────────────────────────────────────

export const LOADING_STEPS = [
  'Analyzing creator profile…',
  'Mapping brand voice signals…',
  'Calculating compatibility scores…',
  'Ranking top 10 matches…',
] as const

export const NICHES = [
  'Fitness & Health',
  'Beauty & Skincare',
  'Fashion & Style',
  'Tech & Gaming',
  'Food & Nutrition',
  'Travel & Lifestyle',
  'Lifestyle & Wellness',
  'Entertainment',
] as const

export const CONTENT_STYLES = [
  'Tutorials & Education',
  'Vlogs & Lifestyle',
  'Reviews & Comparisons',
  'Entertainment & Humor',
  'Challenges & Trends',
  'Raw & Unfiltered',
  'Aspirational & Aesthetic',
] as const

export const PLATFORMS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'X (Twitter)',
  'Twitch',
  'LinkedIn',
] as const

// ── Display helpers ───────────────────────────────────────────

function getFollowerTier(n: number): FollowerTier {
  if (n < 10_000) return 'nano'
  if (n < 100_000) return 'micro'
  if (n < 500_000) return 'mid'
  return 'macro'
}

export function getFollowerTierLabel(followers: number): string {
  return {
    nano: 'Nano creator',
    micro: 'Micro creator',
    mid: 'Mid-tier creator',
    macro: 'Macro creator',
  }[getFollowerTier(followers)]
}

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function formatEarnings(min: number, max: number): string {
  if (min === 0 && max === 0) return '$—'
  const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`)
  return `${fmt(min)} – ${fmt(max)}`
}

// ── Niche ↔ category alignment ────────────────────────────────

function nicheAlignsCat(niche: string, cat: string): boolean {
  const n = niche.toLowerCase()
  return (
    ((n.includes('fitness') || n.includes('health')) && (cat === 'Fitness' || cat === 'Food')) ||
    ((n.includes('beauty') || n.includes('skincare')) && (cat === 'Beauty' || cat === 'Fashion')) ||
    ((n.includes('fashion') || n.includes('style')) && (cat === 'Fashion' || cat === 'Beauty')) ||
    ((n.includes('tech') || n.includes('gaming')) && cat === 'Tech') ||
    ((n.includes('food') || n.includes('nutrition')) && (cat === 'Food' || cat === 'Fitness')) ||
    (n.includes('travel') && (cat === 'Travel' || cat === 'Fashion')) ||
    (n.includes('wellness') && ['Fitness', 'Food', 'Beauty'].includes(cat)) ||
    (n.includes('lifestyle') && ['Fashion', 'Beauty', 'Food', 'Travel'].includes(cat))
  )
}

// ── Compatibility score ───────────────────────────────────────

function computeCompatibilityScore(brand: DiscoveryBrand, profile: CreatorProfile): number {
  let s = brand.compatibilityScore
  const niche = profile.niche.toLowerCase()
  const style = profile.contentStyle.toLowerCase()
  const plat = profile.platform.toLowerCase()
  const cat = brand.category

  // Niche × Category
  if (niche.includes('fitness') || niche.includes('health')) {
    if (cat === 'Fitness') s += 16
    else if (cat === 'Food') s += 9
    else if (cat === 'Tech') s += 3
  } else if (niche.includes('beauty') || niche.includes('skincare')) {
    if (cat === 'Beauty') s += 16
    else if (cat === 'Fashion') s += 8
  } else if (niche.includes('fashion') || niche.includes('style')) {
    if (cat === 'Fashion') s += 15
    else if (cat === 'Beauty') s += 7
  } else if (niche.includes('tech') || niche.includes('gaming')) {
    if (cat === 'Tech') s += 16
    else if (cat === 'Food') s -= 4
  } else if (niche.includes('food') || niche.includes('nutrition')) {
    if (cat === 'Food') s += 16
    else if (cat === 'Fitness') s += 8
  } else if (niche.includes('travel')) {
    if (cat === 'Travel') s += 16
    else if (cat === 'Fashion') s += 6
    else if (cat === 'Food') s += 5
  } else if (niche.includes('lifestyle') || niche.includes('wellness')) {
    if (['Beauty', 'Fashion', 'Food', 'Travel', 'Fitness'].includes(cat)) s += 8
  } else if (niche.includes('entertainment')) {
    if (cat === 'Tech') s += 5
    if (cat === 'Food') s += 6
  }

  // Content style
  if (style.includes('tutorial') || style.includes('education')) {
    if (cat === 'Beauty') s += 9
    if (cat === 'Tech') s += 7
    if (cat === 'Fitness') s += 6
    if (cat === 'Food') s += 5
  } else if (style.includes('raw') || style.includes('unfiltered')) {
    s += brand.difficulty === 'easy' ? 7 : brand.difficulty === 'medium' ? 4 : brand.difficulty === 'hard' ? -3 : -8
  } else if (style.includes('aspirational') || style.includes('aesthetic')) {
    if (cat === 'Fashion') s += 7
    if (cat === 'Beauty') s += 6
    if (cat === 'Travel') s += 8
    if (brand.difficulty === 'hard' || brand.difficulty === 'elite') s += 4
  } else if (style.includes('review') || style.includes('comparison')) {
    if (cat === 'Tech') s += 9
    if (cat === 'Beauty') s += 6
    if (cat === 'Fitness') s += 5
  } else if (style.includes('entertainment') || style.includes('humor')) {
    if (cat === 'Food') s += 7
    if (cat === 'Tech') s += 4
    if (brand.difficulty === 'elite') s -= 6
  } else if (style.includes('challenge') || style.includes('trend')) {
    if (cat === 'Fashion') s += 8
    if (cat === 'Beauty') s += 7
    if (cat === 'Fitness') s += 6
  } else if (style.includes('vlog') || style.includes('lifestyle')) {
    if (cat === 'Travel') s += 9
    if (cat === 'Food') s += 7
    if (cat === 'Fashion') s += 6
  }

  // Platform
  if (plat === 'instagram') {
    if (cat === 'Fashion') s += 6
    if (cat === 'Beauty') s += 6
    if (cat === 'Travel') s += 8
    if (cat === 'Food') s += 5
  } else if (plat === 'tiktok') {
    if (cat === 'Fashion') s += 7
    if (cat === 'Beauty') s += 6
    if (cat === 'Food') s += 8
    if (cat === 'Fitness') s += 5
  } else if (plat === 'youtube') {
    if (cat === 'Tech') s += 9
    if (cat === 'Fitness') s += 6
    if (cat === 'Food') s += 5
    if (cat === 'Beauty') s += 5
  } else if (plat === 'twitch') {
    if (cat === 'Tech') s += 10
    if (cat === 'Food') s += 4
  } else if (plat === 'linkedin') {
    if (cat === 'Tech') s += 7
  }

  // Follower tier × brand difficulty
  const tier = getFollowerTier(profile.followers)
  if (tier === 'nano') {
    if (brand.difficulty === 'elite') s -= 22
    if (brand.difficulty === 'hard') s -= 10
    if (brand.difficulty === 'easy') s += 6
  } else if (tier === 'micro') {
    if (brand.difficulty === 'elite') s -= 12
    if (brand.difficulty === 'easy') s += 4
  } else if (tier === 'macro') {
    if (brand.difficulty === 'elite') s += 6
    if (brand.difficulty === 'easy') s -= 2
  }

  return Math.min(98, Math.max(42, Math.round(s)))
}

// ── Approval rate ─────────────────────────────────────────────

function computeApprovalRate(brand: DiscoveryBrand, profile: CreatorProfile, score: number): number {
  let a = brand.approvalRate
  if (nicheAlignsCat(profile.niche, brand.category)) a += 5
  if (profile.contentStyle.toLowerCase().includes('raw') && brand.difficulty === 'easy') a += 4
  const tier = getFollowerTier(profile.followers)
  if ((tier === 'nano' || tier === 'micro') && brand.difficulty === 'easy') a += 5
  if (score >= 90) a += 3
  return Math.min(95, Math.max(20, Math.round(a)))
}

// ── Earnings ──────────────────────────────────────────────────

function computeEarnings(brand: DiscoveryBrand, followers: number): { min: number; max: number } {
  const tier = getFollowerTier(followers)
  const m = { nano: { min: 0.04, max: 0.12 }, micro: { min: 0.12, max: 0.32 }, mid: { min: 0.32, max: 0.62 }, macro: { min: 0.58, max: 0.92 } }[tier]
  return {
    min: Math.max(0, Math.round((brand.budgetMin * m.min) / 500) * 500),
    max: Math.max(0, Math.round((brand.budgetMax * m.max) / 500) * 500),
  }
}

// ── Match reasons ─────────────────────────────────────────────

function buildReasons(brand: DiscoveryBrand, profile: CreatorProfile, score: number): string[] {
  const aligned = nicheAlignsCat(profile.niche, brand.category)
  const style = profile.contentStyle

  const r1 = aligned
    ? `${profile.niche} content drives 41% higher approval rates on ${brand.category} campaigns`
    : `Cross-niche ${profile.niche} creators show 28% higher audience conversion on ${brand.name} briefs`

  let r2 = `${style} format aligns with ${brand.name}'s current campaign brief requirements`
  if (style.includes('Tutorial') || style.includes('Education'))
    r2 = `${style} format matches ${brand.name}'s top-approved educational content pattern`
  else if (style.includes('Raw') || style.includes('Unfiltered'))
    r2 = `Raw authentic style is ${brand.name}'s #1 approval signal — outperforms polished content by 34%`
  else if (style.includes('Review') || style.includes('Comparison'))
    r2 = `Review-format content earns 2.1× more saves on ${brand.name}'s campaign posts`
  else if (style.includes('Aspirational') || style.includes('Aesthetic'))
    r2 = `Aspirational storytelling directly matches ${brand.name}'s brand voice requirements`
  else if (style.includes('Challenge') || style.includes('Trend'))
    r2 = `Trend-responsive creators achieve ${score >= 80 ? '38%' : '22%'} higher CTR on ${brand.name}'s briefs`
  else if (style.includes('Vlog') || style.includes('Lifestyle'))
    r2 = `Lifestyle format drives authentic product integration — ${brand.name}'s preferred creator style`
  else if (style.includes('Entertainment') || style.includes('Humor'))
    r2 = `Entertainment-first content shows strong engagement multiplier on ${brand.name}'s campaigns`

  let r3 = `Similar audience profile to ${brand.name}'s existing creator roster (${brand.approvalRate}% avg. approval)`
  if (score >= 88)
    r3 = `Achievement-focused content fingerprint matches ${brand.name}'s highest-performing creator pattern`
  else if (score >= 78)
    r3 = `High engagement storytelling aligns with ${brand.name}'s current approval signal database`
  else if (score >= 68)
    r3 = `Audience demographics align with ${brand.name}'s target — above-average approval probability`

  return [r1, r2, r3]
}

// ── Voice signature ───────────────────────────────────────────

export function generateVoiceSignature(profile: CreatorProfile): VoiceTrait[] {
  const byStyle: Record<string, VoiceTrait> = {
    'Tutorials & Education':    { trait: 'Educational authority',  score: 90 },
    'Vlogs & Lifestyle':        { trait: 'Authentic storytelling', score: 87 },
    'Reviews & Comparisons':    { trait: 'Analytical credibility', score: 86 },
    'Entertainment & Humor':    { trait: 'Engagement magnetism',   score: 84 },
    'Challenges & Trends':      { trait: 'Trend responsiveness',   score: 82 },
    'Raw & Unfiltered':         { trait: 'Raw authenticity',       score: 93 },
    'Aspirational & Aesthetic': { trait: 'Aspirational narrative', score: 86 },
  }
  const byNiche: Record<string, VoiceTrait> = {
    'Fitness & Health':     { trait: 'Performance narrative',    score: 89 },
    'Beauty & Skincare':    { trait: 'Category expertise depth', score: 87 },
    'Fashion & Style':      { trait: 'Trend authority',          score: 85 },
    'Tech & Gaming':        { trait: 'Technical credibility',    score: 88 },
    'Food & Nutrition':     { trait: 'Sensory storytelling',     score: 83 },
    'Travel & Lifestyle':   { trait: 'Experiential authority',   score: 85 },
    'Lifestyle & Wellness': { trait: 'Community resonance',      score: 82 },
    'Entertainment':        { trait: 'Audience engagement pull', score: 87 },
  }
  const byPlatform: Record<string, VoiceTrait> = {
    'Instagram':   { trait: 'Visual brand alignment',      score: 82 },
    'TikTok':      { trait: 'Short-form hook mastery',     score: 85 },
    'YouTube':     { trait: 'Long-form trust building',    score: 83 },
    'X (Twitter)': { trait: 'Conversational authority',   score: 75 },
    'Twitch':      { trait: 'Real-time engagement signal', score: 78 },
    'LinkedIn':    { trait: 'Professional credibility',    score: 76 },
  }
  const byTier: Record<FollowerTier, VoiceTrait> = {
    nano:  { trait: 'Hyper-community trust',   score: 92 },
    micro: { trait: 'High-engagement density', score: 86 },
    mid:   { trait: 'Scaled authenticity',     score: 80 },
    macro: { trait: 'Mass reach signal',       score: 76 },
  }

  return [
    byStyle[profile.contentStyle]  ?? { trait: 'Creative voice',   score: 82 },
    byNiche[profile.niche]         ?? { trait: 'Niche authority',   score: 82 },
    byPlatform[profile.platform]   ?? { trait: 'Platform presence', score: 77 },
    byTier[getFollowerTier(profile.followers)],
  ]
}

// ── Core analysis ─────────────────────────────────────────────

function generateMatches(profile: CreatorProfile): BrandMatch[] {
  return searchBrands('', 'all', 'match')
    .map((brand) => {
      const score = computeCompatibilityScore(brand, profile)
      const approval = computeApprovalRate(brand, profile, score)
      const { min: earningsMin, max: earningsMax } = computeEarnings(brand, profile.followers)
      return {
        brandId: brand.id,
        brandName: brand.name,
        brandCategory: brand.category,
        compatibilityScore: score,
        approvalRate: approval,
        earningsMin,
        earningsMax,
        difficulty: brand.difficulty as BrandDifficulty,
        reasons: buildReasons(brand, profile, score),
      } satisfies BrandMatch
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, 10)
}

export function runMatchAnalysis(profile: CreatorProfile): MatchResult {
  return {
    profile,
    voiceSignature: generateVoiceSignature(profile),
    matches: generateMatches(profile),
    generatedAt: new Date().toISOString(),
  }
}

// ── Persistence ───────────────────────────────────────────────

const MATCH_KEY = 'intent_match_result'

export function loadMatchResult(): MatchResult | null {
  try {
    const raw = localStorage.getItem(MATCH_KEY)
    return raw ? (JSON.parse(raw) as MatchResult) : null
  } catch {
    return null
  }
}

export function saveMatchResult(result: MatchResult): void {
  localStorage.setItem(MATCH_KEY, JSON.stringify(result))
  window.dispatchEvent(new CustomEvent('intent:store-updated', { detail: 'match' }))
}

export function clearMatchResult(): void {
  localStorage.removeItem(MATCH_KEY)
}

// ── Difficulty display ────────────────────────────────────────

export { DIFFICULTY_CONFIG }
export type { BrandDifficulty }
