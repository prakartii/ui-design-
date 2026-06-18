// Navigation & UI-only data — not replaced by Supabase
// All monetary values use INR

export const CREATOR_TOOLS = [
  {
    id: 'voice-archaeology',
    name: 'Voice Archaeology',
    desc: 'Decode brand DNA from 847+ analyzed campaigns.',
    icon: '◉',
    path: '/creator/voice-archaeology',
    status: 'live' as const,
  },
  {
    id: 'brief-translator',
    name: 'Brief Translator',
    desc: 'Turn vague briefs into precise creative direction.',
    icon: '⇄',
    path: '/creator/brief-translator',
    status: 'live' as const,
  },
  {
    id: 'creator-match',
    name: 'Creator Match',
    desc: 'Find brands your voice was made for.',
    icon: '◎',
    path: '/creator/creator-match',
    status: 'live' as const,
  },
  {
    id: 'rejection-prevention',
    name: 'Rejection Prevention',
    desc: 'Review your script before you submit it.',
    icon: '⬡',
    path: '/creator/rejection-prevention',
    status: 'live' as const,
  },
  {
    id: 'living-brief',
    name: 'Living Brief',
    desc: 'Briefs that update in real time with campaign data.',
    icon: '↗',
    path: '/creator/living-brief',
    status: 'live' as const,
  },
  {
    id: 'pixel-pact',
    name: 'Pixel Pact',
    desc: 'Smart contracts that verify and release payment.',
    icon: '⬢',
    path: '/creator/pixel-pact',
    status: 'beta' as const,
  },
  {
    id: 'brand-discovery',
    name: 'Brand Discovery',
    desc: 'Surface partnerships where your voice fits.',
    icon: '⊕',
    path: '/creator/brand-discovery',
    status: 'live' as const,
  },
]

// Voice Archaeology — static analysis data (not from DB, patterns are pre-analyzed)
export const VOICE_ARCHAEOLOGY_BRANDS = [
  {
    id: 'nykaa',
    name: 'Nykaa',
    category: 'Beauty & Personal Care',
    posts: 612,
    matchScore: 91,
    patterns: [
      { says: '"glowing skin"', rewards: 'Before-after transformation with lighting' },
      { says: '"natural ingredients"', rewards: 'Close-up ingredient showcase' },
      { says: '"everyday routine"', rewards: 'Morning ritual content' },
    ],
    insight:
      'Nykaa rewards relatability over aspirational perfection. Creators who show real skin texture outperform polished studio looks by 34%.',
  },
  {
    id: 'mamaearth',
    name: 'Mamaearth',
    category: 'Natural Wellness',
    posts: 534,
    matchScore: 87,
    patterns: [
      { says: '"toxin-free"', rewards: 'Ingredient label close-up' },
      { says: '"for the family"', rewards: 'Parent-child moment content' },
      { says: '"planet-friendly"', rewards: 'Sustainability angle storytelling' },
    ],
    insight:
      'Mamaearth content thrives when it leads with trust — ingredient education beats aspirational beauty claims every time.',
  },
  {
    id: 'boat',
    name: 'boAt',
    category: 'Consumer Electronics',
    posts: 847,
    matchScore: 79,
    patterns: [
      { says: '"bass"', rewards: 'Energy-peak moment with product worn' },
      { says: '"squad"', rewards: 'Group activity content' },
      { says: '"style"', rewards: 'Urban aesthetic product placement' },
    ],
    insight:
      'boAt rewards creators who embody the "Desi" energy — street-smart, energetic, and unapologetically Indian. Avoid minimalist aesthetics.',
  },
]
