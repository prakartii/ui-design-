import { generateBrandAnalysis } from './openaiService'
export { OpenAIError } from './openaiService'

// ── Types ─────────────────────────────────────────────────────

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

// ── Loading step messages ──────────────────────────────────────

export const LOADING_STEPS = [
  'Connecting to AI analysis engine…',
  'Mapping brand voice signals…',
  'Extracting approval patterns…',
  'Building brand intelligence…',
] as const

// ── Cache (localStorage) ───────────────────────────────────────

const AI_CACHE_KEY = 'intent_ai_cache'

function toCacheKey(brandName: string, industry: string): string {
  return `${brandName}_${industry}`.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

function loadCache(): Record<string, BrandAnalysis> {
  try {
    return JSON.parse(localStorage.getItem(AI_CACHE_KEY) ?? '{}') as Record<string, BrandAnalysis>
  } catch {
    return {}
  }
}

function writeCache(key: string, analysis: BrandAnalysis): void {
  const cache = loadCache()
  cache[key] = analysis
  localStorage.setItem(AI_CACHE_KEY, JSON.stringify(cache))
}

function readCache(brandName: string, industry: string): BrandAnalysis | null {
  return loadCache()[toCacheKey(brandName, industry)] ?? null
}

export function clearAnalysisCache(): void {
  localStorage.removeItem(AI_CACHE_KEY)
}

// ── Core: AI-powered analysis ──────────────────────────────────

export async function analyzeBrandWithAI(
  brandName: string,
  industry: string,
  description?: string,
): Promise<BrandAnalysis> {
  // Return cached result when no custom description provided
  if (!description) {
    const cached = readCache(brandName, industry)
    if (cached) return cached
  }

  const response = await generateBrandAnalysis(brandName, industry, description)

  const analysis: BrandAnalysis = {
    brandId: toCacheKey(brandName, industry),
    brandName,
    brandCategory: industry,
    postsAnalyzed: response.postsAnalyzed,
    brandScore: Math.min(99, Math.max(1, response.brandScore)),
    approvalConfidence: Math.min(99, Math.max(1, response.approvalConfidence)),
    whatTheySay: response.whatTheySay,
    whatTheyReward: response.whatTheyReward,
    patterns: response.patterns,
    tonePatterns: {
      primary: response.tonePatterns.primary,
      secondary: response.tonePatterns.secondary,
      emotionalIntensity: Math.min(99, Math.max(1, response.tonePatterns.emotionalIntensity)),
      narrativeStyle: response.tonePatterns.narrativeStyle,
    },
    approvalTriggers: response.approvalTriggers,
    forbiddenLanguage: response.forbiddenLanguage,
    patternInsight: response.patternInsight,
    analyzedAt: new Date().toISOString(),
  }

  writeCache(toCacheKey(brandName, industry), analysis)
  return analysis
}

// ── History (localStorage) ─────────────────────────────────────

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
    '  Generated by Intent · intent.app',
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
