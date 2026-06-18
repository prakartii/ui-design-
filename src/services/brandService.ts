import { supabase } from '../lib/supabase'
import type { BrandRow, CampaignRow, CreatorRow, MatchRow } from '../types/database'
import type { Database } from '../types/database'

type BrandInsert = Database['public']['Tables']['brands']['Insert']

export async function getBrandByUserId(userId: string): Promise<BrandRow | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

export async function getBrandCampaigns(brandId: string): Promise<CampaignRow[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getBrandCreatorMatches(
  brandId: string
): Promise<(MatchRow & { creator: CreatorRow })[]> {
  const { data, error } = await supabase
    .from('creator_brand_matches')
    .select('*, creator:creators(*)')
    .eq('brand_id', brandId)
    .order('compatibility_score', { ascending: false })
  if (error) throw error
  return (data as unknown as (MatchRow & { creator: CreatorRow })[]) ?? []
}

export async function getAllBrands(): Promise<BrandRow[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function createBrandProfile(
  userId: string,
  name: string,
  industry?: string
): Promise<BrandRow> {
  const payload: BrandInsert = { user_id: userId, name, industry }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('brands') as any)
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}
