const OPENAI_BASE = 'https://api.openai.com/v1'

// ── Error ─────────────────────────────────────────────────────

export class RejectionAnalysisError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'RejectionAnalysisError'
  }
}

// ── Types ─────────────────────────────────────────────────────

export type IssueLevel = 'critical' | 'high' | 'medium'
export type ContentType = 'script' | 'caption' | 'concept'

export interface ContentIssue {
  id: string
  level: IssueLevel
  title: string
  highlightText: string
  lineContext: string
  pattern: string
  detail: string
  original: string
  improved: string
}

export interface ContentAnalysis {
  id: string
  content: string
  contentType: ContentType
  contentSnippet: string
  riskScore: number
  approvalProbability: number
  issues: ContentIssue[]
  patternInsight: string
  analyzedAt: string
}

// ── Loading steps ─────────────────────────────────────────────

export const LOADING_STEPS = [
  'Scanning content…',
  'Checking approval patterns…',
  'Detecting rejection signals…',
  'Calculating approval probability…',
] as const

// ── System prompt ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert content strategist and brand compliance analyst specializing in creator economy campaigns and influencer marketing.

Your task: analyze creator content (scripts, captions, video concepts) and identify patterns that brands typically reject.

Common rejection triggers to look for:

CRITICAL (near-100% rejection — hard limits):
- Comfort/ease language: "comfortable", "cozy", "easy", "effortless", "simple", "pain-free"
- Discount/price language: any dollar amount, "% off", promo codes, "discount", "sale", "deal"
- Direct buy CTAs inside video/script: "buy now", "purchase today", "order now", "shop now", "click to buy"
- Scripted greetings as opener: "Hey everyone!", "Hi guys!", "What's up everyone!"

HIGH RISK (significant friction — frequent rejection):
- Enthusiasm without proof: "so amazing!", "I'm obsessed!", "best thing ever" without specific evidence
- Resting/static imagery language: "sitting at home", "relaxing on the couch", "chilling", "watching TV"
- Product-first opening (product before person/story)
- "I'm so excited to share" or similar scripted-ad phrasing
- Passive language: product "does it for you", "works itself", "automatically"

MEDIUM (suboptimal, recovery possible):
- Weak hooks with no tension (no conflict, no challenge, no question)
- Missing performance proof (no specific distances, times, outcomes, before/after)
- Closing on a passive, buying, or resting moment
- Generic superlatives without specifics ("the best", "most incredible")
- "Link in bio" said out loud in video (should be text only)

Return ONLY a valid JSON object (no markdown, no explanation outside the JSON) with exactly this structure:
{
  "riskScore": <integer 0-100, based on severity and number of issues>,
  "approvalProbability": <integer 0-100, roughly 100 minus riskScore but AI-adjusted>,
  "issues": [
    {
      "id": "I001",
      "level": "critical" | "high" | "medium",
      "title": "<concise 4-7 word title describing the specific issue>",
      "highlightText": "<EXACT verbatim substring from the provided content — must appear character-for-character in the content>",
      "lineContext": "<the complete sentence or line that contains the issue>",
      "pattern": "<short pattern category, e.g. 'Hard Limit — Comfort Language'>",
      "detail": "<2-3 sentences: why brands reject this, with a specific stat or data point where possible>",
      "original": "<the problematic phrase or sentence>",
      "improved": "<concrete AI rewrite — the actual replacement text, not generic advice>"
    }
  ],
  "patternInsight": "<2-3 sentences: the most important insight about this content's approval risk, with a specific percentage or data point>"
}

Rules:
- riskScore 0-20 = low risk (few/no issues), 21-40 = moderate, 41-65 = high, 66-100 = very high
- Order issues: critical first, then high, then medium
- highlightText MUST be an exact verbatim substring — it will be used for highlighting, so it must match character-for-character
- improved must be a concrete rewrite ("Still locked in after 18km." not "Avoid comfort language and describe performance instead")
- If content is clean with no obvious rejection triggers, return riskScore 10-25 and an empty issues array
- Maximum 8 issues — focus on the most impactful`

// ── API ───────────────────────────────────────────────────────

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
  if (!key) {
    throw new RejectionAnalysisError(
      'Missing VITE_OPENAI_API_KEY — add it to your .env file to enable AI analysis.',
    )
  }
  return key
}

interface AIResponse {
  riskScore: number
  approvalProbability: number
  issues: ContentIssue[]
  patternInsight: string
}

// ── Core analysis ─────────────────────────────────────────────

export async function analyzeContent(
  content: string,
  contentType: ContentType,
): Promise<ContentAnalysis> {
  const key = getApiKey()

  const userMessage = [
    `Content Type: ${contentType}`,
    '',
    'Analyze the following content for brand rejection risks. Return highlightText as exact substrings from this content:',
    '',
    '---',
    content,
    '---',
  ].join('\n')

  let res: Response
  try {
    res = await fetch(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
    })
  } catch (err) {
    throw new RejectionAnalysisError(
      err instanceof Error ? `Network error: ${err.message}` : 'Network error — check your connection.',
    )
  }

  if (!res.ok) {
    let message = `OpenAI request failed (${res.status})`
    try {
      const body = (await res.json()) as { error?: { message?: string } }
      if (body?.error?.message) message = body.error.message
    } catch {
      // ignore
    }
    throw new RejectionAnalysisError(message, res.status)
  }

  let json: { choices: Array<{ message: { content: string } }> }
  try {
    json = (await res.json()) as typeof json
  } catch {
    throw new RejectionAnalysisError('Failed to parse OpenAI response.')
  }

  const rawContent = json.choices?.[0]?.message?.content
  if (!rawContent) throw new RejectionAnalysisError('Empty response from OpenAI.')

  let data: AIResponse
  try {
    data = JSON.parse(rawContent) as AIResponse
  } catch {
    throw new RejectionAnalysisError('OpenAI returned invalid JSON. Please retry.')
  }

  const issues: ContentIssue[] = (data.issues ?? []).map((issue, i) => ({
    ...issue,
    id: issue.id ?? `I${String(i + 1).padStart(3, '0')}`,
    level: (['critical', 'high', 'medium'] as IssueLevel[]).includes(issue.level)
      ? issue.level
      : 'medium',
  }))

  return {
    id: crypto.randomUUID(),
    content,
    contentType,
    contentSnippet: content.slice(0, 120).trim(),
    riskScore: Math.min(100, Math.max(0, Math.round(data.riskScore ?? 50))),
    approvalProbability: Math.min(100, Math.max(0, Math.round(data.approvalProbability ?? 50))),
    issues,
    patternInsight: data.patternInsight ?? '',
    analyzedAt: new Date().toISOString(),
  }
}

// ── History ───────────────────────────────────────────────────

const HISTORY_KEY = 'intent_rejection_history'
const MAX_HISTORY = 10

export function loadHistory(): ContentAnalysis[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as ContentAnalysis[]) : []
  } catch {
    return []
  }
}

export function saveToHistory(analysis: ContentAnalysis): ContentAnalysis[] {
  const history = loadHistory().filter((a) => a.id !== analysis.id)
  const updated = [analysis, ...history].slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  window.dispatchEvent(new CustomEvent('intent:store-updated', { detail: 'analyses' }))
  return updated
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}

// ── Report ────────────────────────────────────────────────────

function formatReport(analysis: ContentAnalysis): string {
  const div = '─'.repeat(54)
  const col = (label: string, value: string) => `${label.padEnd(24)} ${value}`

  const issueBlock = (issue: ContentIssue) =>
    [
      '',
      `[${issue.level.toUpperCase()}] ${issue.id} — ${issue.title}`,
      `  Pattern  : ${issue.pattern}`,
      `  Context  : "${issue.lineContext}"`,
      `  Why      : ${issue.detail}`,
      `  Original : "${issue.original}"`,
      `  Fix      : "${issue.improved}"`,
    ].join('\n')

  const critical = analysis.issues.filter((i) => i.level === 'critical').length
  const high = analysis.issues.filter((i) => i.level === 'high').length
  const medium = analysis.issues.filter((i) => i.level === 'medium').length

  return [
    '╔════════════════════════════════════════════════════════╗',
    '  INTENT Rejection Prevention Report',
    '╚════════════════════════════════════════════════════════╝',
    '',
    col('Generated', new Date(analysis.analyzedAt).toLocaleString()),
    col('Content Type', analysis.contentType),
    col('Risk Score', `${analysis.riskScore}/100`),
    col('Approval Probability', `${analysis.approvalProbability}%`),
    col('Total Issues', String(analysis.issues.length)),
    col('  Critical', String(critical)),
    col('  High', String(high)),
    col('  Medium', String(medium)),
    '',
    div,
    'CONTENT PREVIEW',
    div,
    `"${analysis.contentSnippet}${analysis.contentSnippet.length >= 120 ? '…' : ''}"`,
    '',
    div,
    `ISSUES (${analysis.issues.length} found)`,
    div,
    ...analysis.issues.map(issueBlock),
    '',
    div,
    'PATTERN INSIGHT',
    div,
    `  ${analysis.patternInsight}`,
    '',
    div,
    '  Generated by Intent · intent.app',
    div,
  ].join('\n')
}

export function downloadTextReport(analysis: ContentAnalysis): void {
  const text = formatReport(analysis)
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `intent-rejection-report-${analysis.id.slice(0, 8)}-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadJsonReport(analysis: ContentAnalysis): void {
  const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `intent-rejection-report-${analysis.id.slice(0, 8)}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Utilities ─────────────────────────────────────────────────

export function getRiskColor(score: number): string {
  if (score >= 70) return '#EF4444'
  if (score >= 50) return '#F5A653'
  if (score >= 30) return '#EAB308'
  return '#22C55E'
}

export function getRiskLabel(score: number): string {
  if (score >= 70) return 'Very High Risk'
  if (score >= 50) return 'High Risk'
  if (score >= 30) return 'Medium Risk'
  return 'Low Risk'
}

export const LEVEL_CONFIG = {
  critical: {
    label: 'Critical',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
  },
  high: {
    label: 'High',
    color: '#F5A653',
    bg: 'rgba(245,166,83,0.1)',
    border: 'rgba(245,166,83,0.25)',
  },
  medium: {
    label: 'Medium',
    color: '#EAB308',
    bg: 'rgba(234,179,8,0.1)',
    border: 'rgba(234,179,8,0.25)',
  },
} as const

// Risk score reduction when a fix is applied
export function fixReduction(level: IssueLevel): number {
  if (level === 'critical') return 20
  if (level === 'high') return 12
  return 5
}
