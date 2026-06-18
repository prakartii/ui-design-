// ── Types ─────────────────────────────────────────────────────

export interface BrandProfile {
  id: string
  name: string
  category: string
  posts: number
  region: 'global' | 'india'
}

export interface TonePatterns {
  primary: string
  secondary: string
  emotionalIntensity: number
  narrativeStyle: string
}

export interface PatternRow {
  says: string
  rewards: string
}

export interface BrandAnalysis {
  brandId: string
  brandName: string
  brandCategory: string
  postsAnalyzed: number
  brandScore: number
  approvalConfidence: number
  whatTheySay: string[]
  whatTheyReward: string[]
  patterns: PatternRow[]
  tonePatterns: TonePatterns
  approvalTriggers: string[]
  forbiddenLanguage: string[]
  patternInsight: string
  analyzedAt: string
}

// ── Brand profiles ─────────────────────────────────────────────

export const BRAND_PROFILES: BrandProfile[] = [
  { id: 'nike',       name: 'Nike',       category: 'Athletic Apparel',       posts: 847,  region: 'global' },
  { id: 'gymshark',   name: 'Gymshark',   category: 'Fitness Apparel',         posts: 612,  region: 'global' },
  { id: 'lululemon',  name: 'Lululemon',  category: 'Wellness Apparel',        posts: 534,  region: 'global' },
  { id: 'nykaa',      name: 'Nykaa',      category: 'Beauty & Personal Care',  posts: 723,  region: 'india'  },
  { id: 'mamaearth',  name: 'Mamaearth',  category: 'Natural Wellness',        posts: 489,  region: 'india'  },
  { id: 'boat',       name: 'boAt',       category: 'Consumer Electronics',    posts: 631,  region: 'india'  },
  { id: 'myntra',     name: 'Myntra',     category: 'Fashion & Lifestyle',     posts: 558,  region: 'india'  },
  { id: 'swiggy',     name: 'Swiggy',     category: 'Food & Delivery',         posts: 402,  region: 'india'  },
  { id: 'zomato',     name: 'Zomato',     category: 'Food Discovery',          posts: 387,  region: 'india'  },
  { id: 'flipkart',   name: 'Flipkart',   category: 'E-Commerce',              posts: 516,  region: 'india'  },
]

// ── Analysis database (deterministic per brand) ────────────────

const ANALYSIS_DB: Record<string, Omit<BrandAnalysis, 'brandId' | 'brandName' | 'brandCategory' | 'postsAnalyzed' | 'analyzedAt'>> = {
  nike: {
    brandScore: 87,
    approvalConfidence: 91,
    whatTheySay: ['Authentic', 'Community Driven', 'Just Do It'],
    whatTheyReward: ['Transformation stories', 'Peak achievement moments', 'Struggle-first narratives', 'Social proof'],
    patterns: [
      { says: '"authentic"',        rewards: 'Transformation arc — struggle then breakthrough' },
      { says: '"premium quality"',  rewards: 'Achievement peak with product as the enabler' },
      { says: '"community"',        rewards: 'Peer challenge and social accountability' },
      { says: '"just do it"',       rewards: 'Action-first hooks within the first 3 seconds' },
    ],
    tonePatterns: {
      primary: 'Motivational',
      secondary: 'Competitive',
      emotionalIntensity: 87,
      narrativeStyle: 'Transformation Arc',
    },
    approvalTriggers: [
      'Opens with conflict or struggle in the first 3 seconds',
      'Shows the journey — not just the destination',
      'Product appears as the enabler, not the hero',
      'Real creator voice — no scripted marketing lines',
      'Ends on an achievement peak or earned emotion',
    ],
    forbiddenLanguage: [
      'Generic product praise ("this is so good")',
      'Comfort language ("easy", "effortless", "simple")',
      'Overly polished marketing copy',
      'Discount or coupon code framing',
    ],
    patternInsight:
      'Nike campaigns that begin with struggle and end with achievement receive 41% higher approval rates than campaigns that lead with product features. The product must never be the opening frame.',
  },

  gymshark: {
    brandScore: 91,
    approvalConfidence: 88,
    whatTheySay: ['High Energy', 'Community', 'Functional'],
    whatTheyReward: ['Gym-floor authenticity', 'Training partner content', 'Technical product detail', 'Raw intensity moments'],
    patterns: [
      { says: '"high-energy"',  rewards: 'Gym-floor intensity shots — sweat visible' },
      { says: '"community"',    rewards: 'Training partner or spotter interaction' },
      { says: '"functional"',   rewards: 'Technical detail of the fit and cut' },
      { says: '"results"',      rewards: 'Progress-over-time comparison content' },
    ],
    tonePatterns: {
      primary: 'Energetic',
      secondary: 'Peer-driven',
      emotionalIntensity: 92,
      narrativeStyle: 'Community Activation',
    },
    approvalTriggers: [
      'Filmed in an actual gym — not a studio',
      'Shows another person (training partner) on screen',
      'Product worn during active exercise, not posed',
      'Creator feels like a peer — not a fitness model',
      'Energy is contagious within the first 2 seconds',
    ],
    forbiddenLanguage: [
      'Aspirational perfection — no "goals body" framing',
      'Solo polished poses without gym context',
      'Generic fitness motivation ("believe in yourself")',
      'Overly curated lighting or studio backdrops',
    ],
    patternInsight:
      'Gymshark\'s top-performing content features two or more people 68% of the time. Peer energy outperforms solo motivation content by 2.3× on approval rate.',
  },

  lululemon: {
    brandScore: 79,
    approvalConfidence: 84,
    whatTheySay: ['Mindful', 'Aspirational', 'Wellness-focused'],
    whatTheyReward: ['Stillness within movement', 'Natural light and texture', 'Body-aware sensation language', 'Intentional pacing'],
    patterns: [
      { says: '"mindful"',       rewards: 'Stillness-within-movement — breath visible' },
      { says: '"aspirational"',  rewards: 'Soft, natural light and organic textures' },
      { says: '"wellness"',      rewards: 'Body-aware sensation language — feeling over form' },
      { says: '"community"',     rewards: 'Studio class or outdoor group practice' },
    ],
    tonePatterns: {
      primary: 'Contemplative',
      secondary: 'Aspirational',
      emotionalIntensity: 64,
      narrativeStyle: 'Becoming Arc',
    },
    approvalTriggers: [
      'Pacing is intentionally slow — no jump cuts',
      'Natural lighting — golden hour or diffused indoor',
      'Creator describes sensation, not appearance',
      'Silence or ambient sound used intentionally',
      'Product is shown in movement, not posed',
    ],
    forbiddenLanguage: [
      'Performance metrics or numbers ("burned X calories")',
      'Competitive framing ("better than", "beat your")',
      'Fast-paced cuts or high-energy music',
      'Weight loss or body transformation language',
    ],
    patternInsight:
      'Lululemon approves content where the creator describes how the product *feels* 3× more often than content that describes how it *looks*. Sensation language is the single highest-signal approval indicator.',
  },

  nykaa: {
    brandScore: 94,
    approvalConfidence: 89,
    whatTheySay: ['Radiant', 'Confidence-first', 'For every Indian skin tone'],
    whatTheyReward: ['Honest skin texture reveals', 'Before-after with lighting', 'Application technique closeups', 'Routine integration'],
    patterns: [
      { says: '"glowing skin"',        rewards: 'Before-after transformation with natural lighting' },
      { says: '"natural ingredients"', rewards: 'Ingredient closeup with creator explanation' },
      { says: '"everyday routine"',    rewards: 'Morning ritual with product placed naturally' },
      { says: '"confidence"',          rewards: 'Unscripted emotional reveal at the end' },
    ],
    tonePatterns: {
      primary: 'Empowering',
      secondary: 'Relatable',
      emotionalIntensity: 78,
      narrativeStyle: 'Confidence Reveal',
    },
    approvalTriggers: [
      'Shows real skin texture — not airbrushed',
      'Creator explains the product in their own words',
      'Application technique visible, not just product shot',
      'Ends with confidence or emotional payoff',
      'Indian skin tones represented authentically',
    ],
    forbiddenLanguage: [
      'Eurocentric beauty standards framing',
      'Skin whitening or fairness language',
      'Overly glamorous or unattainable looks',
      'Generic "this changed my skin" without specifics',
    ],
    patternInsight:
      'Nykaa content featuring Indian skin tones in unretouched lighting receives 38% higher engagement and 51% higher approval rates than content using studio-lit, filtered aesthetics.',
  },

  mamaearth: {
    brandScore: 89,
    approvalConfidence: 86,
    whatTheySay: ['Toxin-free', 'Safe for the family', 'Planet-friendly'],
    whatTheyReward: ['Ingredient education content', 'Parent-child trust moments', 'Sustainability storytelling', 'Everyday protection'],
    patterns: [
      { says: '"toxin-free"',      rewards: 'Ingredient label closeup with creator reading it' },
      { says: '"for the family"',  rewards: 'Parent-child interaction using the product' },
      { says: '"natural"',         rewards: 'Outdoor or nature-adjacent setting' },
      { says: '"safe"',            rewards: 'Trust-building moment — creator\'s own child or family' },
    ],
    tonePatterns: {
      primary: 'Trustworthy',
      secondary: 'Nurturing',
      emotionalIntensity: 71,
      narrativeStyle: 'Trust Build',
    },
    approvalTriggers: [
      'Leads with "why I switched" story — not product features',
      'Shows ingredients being read — not just mentioned',
      'Family context present — child, partner, or parent',
      'Creator expresses genuine concern, not enthusiasm',
      'Sustainability or environmental angle mentioned',
    ],
    forbiddenLanguage: [
      'Exaggerated claims ("fastest hair growth in 7 days")',
      'Clinical or pharmaceutical language',
      'Competitor comparison framing',
      'Aggressive sales urgency ("limited stock", "order now")',
    ],
    patternInsight:
      'Mamaearth\'s highest-performing content leads with a problem the creator personally experienced — not with the product. Vulnerability before solution drives 44% higher trust signal scores.',
  },

  boat: {
    brandScore: 82,
    approvalConfidence: 85,
    whatTheySay: ['Bass that hits', 'Made for India', 'Squad energy'],
    whatTheyReward: ['Energy-peak product use', 'Urban India aesthetic', 'Group activity content', 'Style-first moments'],
    patterns: [
      { says: '"bass"',         rewards: 'Visible physical reaction to sound — head nod, bounce' },
      { says: '"squad"',        rewards: 'Group of friends using or reacting to the product' },
      { says: '"style"',        rewards: 'Urban India aesthetic — streets, chai stalls, metro' },
      { says: '"desi"',         rewards: 'Code-switching between English and Hindi naturally' },
    ],
    tonePatterns: {
      primary: 'Energetic',
      secondary: 'Culturally rooted',
      emotionalIntensity: 89,
      narrativeStyle: 'Desi Energy Arc',
    },
    approvalTriggers: [
      'Product worn in the real world — not a studio',
      'Physical energy reaction captured on camera',
      'Hindi or Hinglish used naturally (not forced)',
      'Urban India setting — streets, real locations',
      'Group dynamic or friend reaction visible',
    ],
    forbiddenLanguage: [
      'Western aesthetic framing ("minimalist", "clean")',
      'Overly technical specs without energy',
      'Formal or corporate language',
      'Comparison to premium global brands',
    ],
    patternInsight:
      'boAt content that naturally incorporates Hinglish receives 47% higher organic reach than English-only content. Authentic cultural identity — not performance of it — is the approval signal.',
  },

  myntra: {
    brandScore: 86,
    approvalConfidence: 88,
    whatTheySay: ['Trend-forward', 'Accessible luxury', 'Express yourself'],
    whatTheyReward: ['Outfit transformation reveals', 'Mix-and-match styling', 'Fashion storytelling', 'Trend participation'],
    patterns: [
      { says: '"trending"',          rewards: 'Outfit reveal with trending audio or format' },
      { says: '"style statement"',   rewards: 'Multiple outfit iterations in one video' },
      { says: '"accessible"',        rewards: 'Price reveal that creates positive surprise' },
      { says: '"express yourself"',  rewards: 'Creator personality visible through fashion choices' },
    ],
    tonePatterns: {
      primary: 'Expressive',
      secondary: 'Aspirational',
      emotionalIntensity: 81,
      narrativeStyle: 'Style Reveal',
    },
    approvalTriggers: [
      'Starts with a style problem or occasion (not the product)',
      'Shows multiple looks — not just a single outfit',
      'Price point revealed as a positive surprise',
      'Creator\'s personality is the hero — fashion is the vehicle',
      'Uses trending audio or format natively',
    ],
    forbiddenLanguage: [
      'Generic fashion adjectives ("cute", "nice", "pretty")',
      'Overly formal posing without personality',
      'Unboxing format without styling context',
      'Comparison to luxury brand pricing',
    ],
    patternInsight:
      'Myntra content that shows 3 or more complete outfit options receives 52% higher saves and 31% higher approval rates. The platform rewards decision-enabling content over single-look showcases.',
  },

  swiggy: {
    brandScore: 83,
    approvalConfidence: 87,
    whatTheySay: ['Delivered fast', 'Cravings sorted', 'Good food, good mood'],
    whatTheyReward: ['Genuine hunger moments', 'Late-night craving content', 'Discovery storytelling', 'Food reaction authenticity'],
    patterns: [
      { says: '"fast delivery"',   rewards: 'Timer-based reveal — order to delivery documented' },
      { says: '"craving"',         rewards: 'Authentic hunger moment — not staged eating' },
      { says: '"discovery"',       rewards: 'First-time trying a dish or restaurant' },
      { says: '"convenience"',     rewards: 'Real-life context — work, study, post-gym' },
    ],
    tonePatterns: {
      primary: 'Conversational',
      secondary: 'Spontaneous',
      emotionalIntensity: 74,
      narrativeStyle: 'Craving Resolution',
    },
    approvalTriggers: [
      'Starts with a real situation — not a product intro',
      'Delivery time documented or referenced authentically',
      'Food reaction is genuine — not over-performed',
      'Everyday context shown — not aspirational setting',
      'Creator\'s personality drives the narrative',
    ],
    forbiddenLanguage: [
      'Overly staged or food-porn aesthetics',
      'Formal review language ("notes of", "perfectly seasoned")',
      'Restaurant or competitor brand callouts',
      'Unboxing format applied to food delivery',
    ],
    patternInsight:
      'Swiggy\'s top-performing creator content shows the delivery experience as a "solved problem" — not a feature. Content that starts with a hunger or convenience pain point converts 39% better than content that leads with the app.',
  },

  zomato: {
    brandScore: 85,
    approvalConfidence: 86,
    whatTheySay: ['Food is emotion', 'Discover what\'s near you', 'Never miss a meal'],
    whatTheyReward: ['Restaurant discovery storytelling', 'Emotional food moments', 'Honest reviews', 'Local food culture'],
    patterns: [
      { says: '"discover"',      rewards: 'First-visit story — creator found something new' },
      { says: '"honest review"', rewards: 'Unfiltered opinion including one criticism' },
      { says: '"comfort food"',  rewards: 'Emotional memory tied to the food or restaurant' },
      { says: '"local"',         rewards: 'Small or independent restaurant featured, not chain' },
    ],
    tonePatterns: {
      primary: 'Curious',
      secondary: 'Emotionally warm',
      emotionalIntensity: 76,
      narrativeStyle: 'Discovery Journey',
    },
    approvalTriggers: [
      'Creator visits a place they haven\'t been before',
      'At least one honest, specific criticism included',
      'Emotional connection or memory tied to the food',
      'Local or independent restaurant preferred over chain',
      'Authentic recommendation — not a promotional read',
    ],
    forbiddenLanguage: [
      'Superlative claims without specifics ("best biryani ever")',
      'Pure promotional tone with no critical perspective',
      'Only chain restaurants without local discovery',
      'Food styling without personality or context',
    ],
    patternInsight:
      'Zomato content that includes one specific criticism or nuance receives 33% higher trust scores from viewers — and 28% higher creator approval rates from the brand. Authenticity, not perfection, is the signal.',
  },

  flipkart: {
    brandScore: 81,
    approvalConfidence: 84,
    whatTheySay: ['Value for India', 'Shop smart', 'Trusted deals'],
    whatTheyReward: ['Value-discovery moments', 'Deal storytelling', 'Relatable shopping behaviour', 'Product comparison context'],
    patterns: [
      { says: '"value"',          rewards: 'Price reveal that creates genuine surprise or delight' },
      { says: '"trusted"',        rewards: 'Delivery and packaging trust moment' },
      { says: '"smart shopping"', rewards: 'Comparison context — what you get vs. what you pay' },
      { says: '"India\'s own"',   rewards: 'Pride in domestic platform — Desi narrative' },
    ],
    tonePatterns: {
      primary: 'Reassuring',
      secondary: 'Value-driven',
      emotionalIntensity: 72,
      narrativeStyle: 'Smart Discovery',
    },
    approvalTriggers: [
      'Starts with a real purchase decision or need',
      'Price-to-value ratio made explicit and positive',
      'Delivery or unboxing shown as trust moment',
      'Speaks to middle-India aspirations — not luxury',
      'Creator\'s genuine enthusiasm — not over-performing',
    ],
    forbiddenLanguage: [
      'Luxury or aspirational framing incongruent with value',
      'Platform comparison framing (Amazon, Meesho)',
      'Overly salesy countdown or scarcity tactics',
      'Generic unboxing without purchase context or story',
    ],
    patternInsight:
      'Flipkart content that reveals the price as a "pleasant surprise" within the first 15 seconds drives 44% higher click-through rates. Value discovery — not product features — is the primary approval signal.',
  },
}

// ── Core analysis function ─────────────────────────────────────

export function analyzeBrand(brandId: string): BrandAnalysis {
  const profile = BRAND_PROFILES.find((b) => b.id === brandId)
  if (!profile) throw new Error(`Unknown brand: ${brandId}`)

  const data = ANALYSIS_DB[brandId]
  if (!data) throw new Error(`No analysis data for brand: ${brandId}`)

  return {
    brandId: profile.id,
    brandName: profile.name,
    brandCategory: profile.category,
    postsAnalyzed: profile.posts,
    analyzedAt: new Date().toISOString(),
    ...data,
  }
}

// ── Loading step messages ──────────────────────────────────────

export const LOADING_STEPS = [
  'Analyzing approved campaigns…',
  'Extracting approval patterns…',
  'Building brand intelligence…',
  'Comparing accepted vs. rejected content…',
] as const

// ── localStorage history ───────────────────────────────────────

const HISTORY_KEY = 'intent_voice_history'
const MAX_HISTORY = 10

export function loadHistory(): BrandAnalysis[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as BrandAnalysis[]) : []
  } catch {
    return []
  }
}

export function saveToHistory(analysis: BrandAnalysis): BrandAnalysis[] {
  const history = loadHistory().filter((a) => a.brandId !== analysis.brandId)
  const updated = [analysis, ...history].slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  return updated
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}

// ── Export utilities ───────────────────────────────────────────

export function formatAnalysisText(a: BrandAnalysis): string {
  const line = (label: string, value: string) => `${label.padEnd(24)} ${value}`
  const section = (title: string) => `\n── ${title} ${'─'.repeat(Math.max(0, 44 - title.length))}\n`

  return [
    '╔══════════════════════════════════════════════════╗',
    `  INTENT Voice Archaeology — ${a.brandName}`,
    '╚══════════════════════════════════════════════════╝',
    '',
    line('Brand', a.brandName),
    line('Category', a.brandCategory),
    line('Posts Analyzed', a.postsAnalyzed.toLocaleString()),
    line('Brand Score', `${a.brandScore}%`),
    line('Approval Confidence', `${a.approvalConfidence}%`),
    line('Analyzed At', new Date(a.analyzedAt).toLocaleString('en-IN')),
    '',
    section('WHAT THEY SAY'),
    a.whatTheySay.map((s) => `  • ${s}`).join('\n'),
    '',
    section('WHAT THEY REWARD'),
    a.whatTheyReward.map((r) => `  • ${r}`).join('\n'),
    '',
    section('TONE PATTERNS'),
    line('  Primary', a.tonePatterns.primary),
    line('  Secondary', a.tonePatterns.secondary),
    line('  Emotional Intensity', `${a.tonePatterns.emotionalIntensity}%`),
    line('  Narrative Style', a.tonePatterns.narrativeStyle),
    '',
    section('APPROVAL TRIGGERS'),
    a.approvalTriggers.map((t) => `  ✓ ${t}`).join('\n'),
    '',
    section('FORBIDDEN LANGUAGE'),
    a.forbiddenLanguage.map((f) => `  ✗ ${f}`).join('\n'),
    '',
    section('PATTERN INSIGHT'),
    `  ${a.patternInsight}`,
    '',
    '─'.repeat(50),
    `  Generated by Intent · intent.app`,
    '─'.repeat(50),
  ].join('\n')
}

export async function copyAnalysis(a: BrandAnalysis): Promise<void> {
  await navigator.clipboard.writeText(formatAnalysisText(a))
}

export function downloadTextReport(a: BrandAnalysis): void {
  const text = formatAnalysisText(a)
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `intent-voice-archaeology-${a.brandId}-${Date.now()}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadJsonReport(a: BrandAnalysis): void {
  const blob = new Blob([JSON.stringify(a, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `intent-voice-archaeology-${a.brandId}-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}
