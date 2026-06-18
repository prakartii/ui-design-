import { supabase } from '../lib/supabase'
import type { CreatorRow, CampaignRow, MatchRow, BrandRow } from '../types/database'
import type { Database } from '../types/database'

type CreatorInsert = Database['public']['Tables']['creators']['Insert']

export async function getCreatorByUserId(userId: string): Promise<CreatorRow | null> {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

export async function getCreatorCampaigns(
  creatorId: string
): Promise<(CampaignRow & { brand: BrandRow | null })[]> {
  const { data, error } = await supabase
    .from('campaign_creators')
    .select('campaign:campaigns(*, brand:brands(*))')
    .eq('creator_id', creatorId)
    .eq('status', 'active')
  if (error) throw error
  return (
    (data ?? []).map(
      (r) => (r as unknown as { campaign: CampaignRow & { brand: BrandRow | null } }).campaign
    )
  )
}

export async function getCreatorMatches(
  creatorId: string
): Promise<(MatchRow & { brand: BrandRow })[]> {
  const { data, error } = await supabase
    .from('creator_brand_matches')
    .select('*, brand:brands(*)')
    .eq('creator_id', creatorId)
    .order('compatibility_score', { ascending: false })
  if (error) throw error
  return (data as unknown as (MatchRow & { brand: BrandRow })[]) ?? []
}

export async function getAllCreators(): Promise<CreatorRow[]> {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .order('followers', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createCreatorProfile(
  userId: string,
  handle: string,
  niche?: string
): Promise<CreatorRow> {
  const payload: CreatorInsert = { user_id: userId, handle, niche }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('creators') as any)
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}
