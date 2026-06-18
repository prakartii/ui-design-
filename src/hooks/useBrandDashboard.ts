import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { getBrandByUserId, getBrandCreatorMatches } from '../services/brandService'
import { getCampaignsByBrand, getCampaignStats } from '../services/campaignService'
import type { BrandRow, CampaignRow, MatchRow, CreatorRow } from '../types/database'

interface BrandDashboardData {
  brand: BrandRow | null
  campaigns: CampaignRow[]
  topMatches: (MatchRow & { creator: CreatorRow })[]
  stats: {
    total: number
    active: number
    completed: number
    totalBudget: number
    spent: number
  }
}

interface State {
  data: BrandDashboardData | null
  loading: boolean
  error: string | null
}

export function useBrandDashboard() {
  const { user } = useAuth()
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })

  useEffect(() => {
    if (!user) return

    let cancelled = false

    async function load() {
      try {
        const brand = await getBrandByUserId(user!.id)
        if (!brand) {
          setState({
            data: {
              brand: null,
              campaigns: [],
              topMatches: [],
              stats: { total: 0, active: 0, completed: 0, totalBudget: 0, spent: 0 },
            },
            loading: false,
            error: null,
          })
          return
        }

        const [campaigns, topMatches, stats] = await Promise.all([
          getCampaignsByBrand(brand.id),
          getBrandCreatorMatches(brand.id),
          getCampaignStats(brand.id),
        ])

        if (!cancelled) {
          setState({ data: { brand, campaigns, topMatches, stats }, loading: false, error: null })
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
