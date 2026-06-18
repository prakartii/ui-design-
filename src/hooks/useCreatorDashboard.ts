import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { getCreatorByUserId, getCreatorMatches, getCreatorCampaigns } from '../services/creatorService'
import { getMatchStats } from '../services/matchService'
import type { CreatorRow, CampaignRow, MatchRow, BrandRow } from '../types/database'

export type EnrichedCampaign = CampaignRow & { brand: BrandRow | null }

interface CreatorDashboardData {
  creator: CreatorRow | null
  campaigns: EnrichedCampaign[]
  matches: (MatchRow & { brand: BrandRow })[]
  matchCount: number
}

interface State {
  data: CreatorDashboardData | null
  loading: boolean
  error: string | null
}

export function useCreatorDashboard() {
  const { user } = useAuth()
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })

  useEffect(() => {
    if (!user) return

    let cancelled = false

    async function load() {
      try {
        const creator = await getCreatorByUserId(user!.id)
        if (!creator) {
          setState({ data: { creator: null, campaigns: [], matches: [], matchCount: 0 }, loading: false, error: null })
          return
        }

        const [campaigns, matches, { total: matchCount }] = await Promise.all([
          getCreatorCampaigns(creator.id),
          getCreatorMatches(creator.id),
          getMatchStats(creator.id),
        ])

        if (!cancelled) {
          setState({ data: { creator, campaigns, matches, matchCount }, loading: false, error: null })
        }
      } catch (err) {
        if (!cancelled) {
          setState({ data: null, loading: false, error: (err as Error).message })
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [user])

  return state
}
