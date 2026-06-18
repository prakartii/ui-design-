import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { getBrandByUserId } from '../services/brandService'
import { getCampaignsByBrand, getAllLivingBriefs } from '../services/campaignService'
import type { CampaignRow, LivingBriefRow } from '../types/database'

interface State {
  campaigns: CampaignRow[]
  livingBriefs: LivingBriefRow[]
  loading: boolean
  error: string | null
}

export function useCampaigns() {
  const { user } = useAuth()
  const [state, setState] = useState<State>({ campaigns: [], livingBriefs: [], loading: true, error: null })

  useEffect(() => {
    if (!user) return

    let cancelled = false

    async function load() {
      try {
        if (user!.role === 'brand') {
          const brand = await getBrandByUserId(user!.id)
          const campaigns = brand ? await getCampaignsByBrand(brand.id) : []
          const livingBriefs = await getAllLivingBriefs()
          if (!cancelled) setState({ campaigns, livingBriefs, loading: false, error: null })
        } else {
          const livingBriefs = await getAllLivingBriefs()
          if (!cancelled) setState({ campaigns: [], livingBriefs, loading: false, error: null })
        }
      } catch (err) {
        if (!cancelled) setState({ campaigns: [], livingBriefs: [], loading: false, error: (err as Error).message })
      }
    }

    load()
    return () => { cancelled = true }
  }, [user])

  return state
}
