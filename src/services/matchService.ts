import { supabase } from '../lib/supabase'
import type { MatchRow, BrandRow, CreatorRow } from '../types/database'

export async function getMatchesByCreator(
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

export async function getMatchesByBrand(
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

export async function getMatchStats(creatorId: string) {
  const { count, error } = await supabase
    .from('creator_brand_matches')
    .select('id', { count: 'exact', head: true })
    .eq('creator_id', creatorId)
  if (error) throw error
  return { total: count ?? 0 }
}
