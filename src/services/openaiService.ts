const OPENAI_BASE = 'https://api.openai.com/v1'

export class OpenAIError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'OpenAIError'
  }
}

export interface AIBrandAnalysisResponse {
  brandScore: number
  approvalConfidence: number
  postsAnalyzed: number
  whatTheySay: string[]
  whatTheyReward: string[]
  patterns: Array<{ says: string; rewards: string }>
  tonePatterns: {
    primary: string
    secondary: string
    emotionalIntensity: number
    narrativeStyle: string
  }
  approvalTriggers: string[]
  forbiddenLanguage: string[]
  patternInsight: string
}

const SYSTEM_PROMPT = `You are an expert brand strategist and content intelligence analyst specializing in the creator economy and influencer marketing.

Your task: analyze a brand's voice DNA — specifically what they publicly claim vs. what creator content they actually approve and reward based on publicly known patterns about the brand.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "brandScore": <integer 60-99 representing creator-brand compatibility>,
  "approvalConfidence": <integer 70-99 representing analysis confidence>,
  "postsAnalyzed": <realistic integer like 300-1400>,
  "whatTheySay": [<3-5 exact brand messaging pillar strings they use publicly, each quoted>],
  "whatTheyReward": [<4-6 specific content behaviors they actually approve, concrete and actionable>],
  "patterns": [
    { "says": "<quoted brand value phrase>", "rewards": "<specific content behavior they actually reward>" }
  ],
  "tonePatterns": {
    "primary": "<single descriptor word>",
    "secondary": "<single descriptor word>",
    "emotionalIntensity": <integer 40-99>,
    "narrativeStyle": "<2-3 word arc name e.g. 'Transformation Arc'>"
  },
  "approvalTriggers": [<5-7 specific, actionable content triggers that consistently get approved>],
  "forbiddenLanguage": [<4-6 specific language patterns, formats, or content types that consistently get rejected>],
  "patternInsight": "<2-3 sentence insight revealing the most surprising or counterintuitive pattern, include a specific percentage or data-like stat>"
}

Be specific and non-generic. Every item must be actionable. Avoid platitudes. The insight should feel like it came from analyzing thousands of real campaigns.`

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
  if (!key) {
    throw new OpenAIError(
      'Missing VITE_OPENAI_API_KEY — add it to your .env file to enable AI analysis.',
    )
  }
  return key
}

export async function generateBrandAnalysis(
  brandName: string,
  industry: string,
  description?: string,
): Promise<AIBrandAnalysisResponse> {
  const key = getApiKey()

  const userMessage = [
    `Brand Name: ${brandName}`,
    `Industry: ${industry}`,
    description ? `Brand Description: ${description}` : 'Brand Description: Not provided',
    '',
    "Analyze this brand's voice archaeology — the gap between what they claim and what creator content they actually reward vs. reject.",
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
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
    })
  } catch (err) {
    throw new OpenAIError(
      err instanceof Error ? `Network error: ${err.message}` : 'Network error — check your connection.',
    )
  }

  if (!res.ok) {
    let message = `OpenAI request failed (${res.status})`
    try {
      const body = (await res.json()) as { error?: { message?: string } }
      if (body?.error?.message) message = body.error.message
    } catch {
      // ignore parse error
    }
    throw new OpenAIError(message, res.status)
  }

  let json: { choices: Array<{ message: { content: string } }> }
  try {
    json = (await res.json()) as typeof json
  } catch {
    throw new OpenAIError('Failed to parse OpenAI response.')
  }

  const content = json.choices?.[0]?.message?.content
  if (!content) throw new OpenAIError('Empty response from OpenAI.')

  try {
    return JSON.parse(content) as AIBrandAnalysisResponse
  } catch {
    throw new OpenAIError('OpenAI returned invalid JSON. Please retry.')
  }
}
