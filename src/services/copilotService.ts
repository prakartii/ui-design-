import type { ContentAnalysis } from './rejectionPreventionService'
import type { DiscoveryBrand } from './brandDiscoveryService'
import type { MatchResult } from './creatorMatchService'
import { formatFollowers } from './creatorMatchService'
import type { FeedEvent } from './livingBriefService'

const OPENAI_BASE = 'https://api.openai.com/v1'

// ── Error ─────────────────────────────────────────────────────

export class CopilotError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'CopilotError'
  }
}

// ── Types ─────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface CopilotContext {
  analysisHistory: ContentAnalysis[]
  allBrands: DiscoveryBrand[]
  savedBrandIds: Set<string>
  matchResult: MatchResult | null
  briefFeed: FeedEvent[]
}

// ── Suggested prompts ─────────────────────────────────────────

export const SUGGESTED_PROMPTS = [
  'What brands match my content?',
  'Why was my last script rejected?',
  'Which brands have the highest approval rate?',
  "What's trending in campaign intelligence?",
  'Summarize my voice signature',
  'Which saved brands should I pitch first?',
  'What rejection signals should I avoid?',
  'Improve my pitch for a top brand match',
] as const

// ── System prompt builder ─────────────────────────────────────

export function buildSystemPrompt(ctx: CopilotContext | null): string {
  const base = `You are Intent AI Copilot — a contextual assistant embedded inside Intent, a creator brand intelligence platform.

Your role: help creators understand their brand matches, approval risks, content strategy, and campaign intelligence using their real platform data.

Response style:
• Concise — 2-4 short paragraphs unless the user asks for more detail
• Use • bullet points when listing multiple items
• Reference real data (scores, brand names, specific metrics) when it is available in context
• For content improvement requests, provide a concrete rewrite example — not generic advice
• Tone: direct, expert, warm — like a senior brand strategist who has reviewed the data`

  if (!ctx) {
    return (
      base +
      '\n\n[No creator data is loaded yet. Encourage the user to run Creator Match, analyze content in Rejection Prevention, or save brands in Brand Discovery to unlock personalized insights.]'
    )
  }

  const sections: string[] = []

  // Profile + voice signature
  if (ctx.matchResult) {
    const p = ctx.matchResult.profile
    sections.push(
      `CREATOR PROFILE: ${p.niche} | ${formatFollowers(p.followers)} followers | ${p.platform} | ${p.contentStyle}`,
    )

    const sig = ctx.matchResult.voiceSignature
    if (sig.length > 0) {
      sections.push(
        `VOICE SIGNATURE:\n${sig.map((t) => `• ${t.trait}: ${t.score}%`).join('\n')}`,
      )
    }

    const matches = ctx.matchResult.matches
    if (matches.length > 0) {
      sections.push(
        `TOP BRAND MATCHES (${matches.length} total ranked):\n` +
          matches
            .slice(0, 6)
            .map(
              (m, i) =>
                `${i + 1}. ${m.brandName} — ${m.compatibilityScore}% compat · ${m.approvalRate}% approval · ${m.brandCategory} · ${m.difficulty} difficulty`,
            )
            .join('\n'),
      )
    }
  }

  // Saved brands
  if (ctx.savedBrandIds.size > 0) {
    const saved = ctx.allBrands
      .filter((b) => ctx.savedBrandIds.has(b.id))
      .slice(0, 12)
    sections.push(
      `SAVED BRANDS (${ctx.savedBrandIds.size}): ` +
        saved.map((b) => `${b.name} (${b.compatibilityScore}%)`).join(', '),
    )
  }

  // Risk analyses
  if (ctx.analysisHistory.length > 0) {
    const recent = ctx.analysisHistory.slice(0, 3)
    sections.push(
      `RECENT RISK ANALYSES:\n` +
        recent
          .map((a) => {
            const crit = a.issues.filter((i) => i.level === 'critical').length
            const high = a.issues.filter((i) => i.level === 'high').length
            return (
              `• "${a.contentSnippet.slice(0, 70)}${a.contentSnippet.length > 70 ? '…' : ''}"` +
              ` | ${a.contentType} | Risk ${a.riskScore}/100 | Approval ${a.approvalProbability}%` +
              (crit > 0 ? ` | ${crit} critical` : '') +
              (high > 0 ? ` | ${high} high` : '') +
              (a.issues.length === 0 ? ' | Clean' : '')
            )
          })
          .join('\n'),
    )

    // Surface the top critical issues for context
    const topIssues = ctx.analysisHistory
      .flatMap((a) => a.issues.filter((i) => i.level === 'critical'))
      .slice(0, 4)
    if (topIssues.length > 0) {
      sections.push(
        `RECENT CRITICAL PATTERNS:\n` +
          topIssues
            .map((i) => `• "${i.highlightText}" → ${i.title} (${i.pattern})`)
            .join('\n'),
      )
    }
  }

  // Campaign intelligence
  if (ctx.briefFeed.length > 0) {
    sections.push(
      `LIVE CAMPAIGN INTELLIGENCE:\n` +
        ctx.briefFeed
          .slice(0, 6)
          .map((e) => `• ${e.title}${e.metric ? ` (${e.metric})` : ''}: ${e.detail.slice(0, 90)}`)
          .join('\n'),
    )
  }

  if (sections.length === 0) {
    return (
      base +
      '\n\n[Creator has not run any analyses yet. Suggest they start with Creator Match to get brand recommendations, or Rejection Prevention to analyze their content.]'
    )
  }

  return base + '\n\n=== CREATOR DATA ===\n\n' + sections.join('\n\n')
}

// ── API key ───────────────────────────────────────────────────

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
  if (!key) {
    throw new CopilotError(
      'No API key found. Add VITE_OPENAI_API_KEY to your .env file to enable the AI Copilot.',
    )
  }
  return key
}

// ── Streaming call ────────────────────────────────────────────

export async function askCopilot(
  conversationMessages: CopilotMessage[],
  systemPrompt: string,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const key = getApiKey()

  // Keep last 16 exchanges to stay within context limits
  const recent = conversationMessages.slice(-16)

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
        stream: true,
        temperature: 0.72,
        max_tokens: 700,
        messages: [
          { role: 'system', content: systemPrompt },
          ...recent.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    })
  } catch (err) {
    throw new CopilotError(
      err instanceof Error ? `Network error: ${err.message}` : 'Network error — check your connection.',
    )
  }

  if (!res.ok) {
    let msg = `OpenAI error (${res.status})`
    try {
      const body = (await res.json()) as { error?: { message?: string } }
      if (body?.error?.message) msg = body.error.message
    } catch { /* ignore */ }
    throw new CopilotError(msg, res.status)
  }

  if (!res.body) throw new CopilotError('Empty response body from OpenAI.')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  // Parse SSE stream
  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value, { stream: true })
    const lines = text.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)
      if (data === '[DONE]') return

      try {
        const json = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> }
        const chunk = json.choices?.[0]?.delta?.content
        if (chunk) onChunk(chunk)
      } catch {
        // malformed SSE chunk — skip
      }
    }
  }
}

// ── Conversation persistence ───────────────────────────────────

const HISTORY_KEY = 'intent_copilot_history'
const MAX_STORED = 60

export function loadConversation(): CopilotMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as CopilotMessage[]) : []
  } catch {
    return []
  }
}

export function saveConversation(messages: CopilotMessage[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-MAX_STORED)))
}

export function clearConversation(): void {
  localStorage.removeItem(HISTORY_KEY)
}
