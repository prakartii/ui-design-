// Supabase is temporarily disabled. All data uses localStorage.
// To restore: uncomment the supabase block and remove the mock block.

/*
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'
type CreatorInsert = Database['public']['Tables']['creators']['Insert']

export async function getCreatorByUserId(userId: string): Promise<CreatorRow | null> {
  const { data, error } = await supabase.from('creators').select('*').eq('user_id', userId).single()
  if (error) return null
  return data
}

export async function getCreatorCampaigns(creatorId: string): Promise<(CampaignRow & { brand: BrandRow | null })[]> {
  const { data, error } = await supabase
    .from('campaign_creators')
    .select('campaign:campaigns(*, brand:brands(*))')
    .eq('creator_id', creatorId)
    .eq('status', 'active')
  if (error) throw error
  return (data ?? []).map((r) => (r as unknown as { campaign: CampaignRow & { brand: BrandRow | null } }).campaign)
}

export async function getCreatorMatches(creatorId: string): Promise<(MatchRow & { brand: BrandRow })[]> {
  const { data, error } = await supabase
    .from('creator_brand_matches')
    .select('*, brand:brands(*)')
    .eq('creator_id', creatorId)
    .order('compatibility_score', { ascending: false })
  if (error) throw error
  return (data as unknown as (MatchRow & { brand: BrandRow })[]) ?? []
}

export async function getAllCreators(): Promise<CreatorRow[]> {
  const { data, error } = await supabase.from('creators').select('*').order('followers', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createCreatorProfile(userId: string, handle: string, niche?: string): Promise<CreatorRow> {
  const payload: CreatorInsert = { user_id: userId, handle, niche }
  const { data, error } = await (supabase.from('creators') as any).insert(payload).select().single()
  if (error) throw error
  return data
}
*/

import type { CreatorRow, CampaignRow, MatchRow, BrandRow } from '../types/database'

const CREATORS_KEY = 'mock_creators'

function getAll(): CreatorRow[] {
  try {
    return JSON.parse(localStorage.getItem(CREATORS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveAll(rows: CreatorRow[]) {
  localStorage.setItem(CREATORS_KEY, JSON.stringify(rows))
}

export async function getCreatorByUserId(userId: string): Promise<CreatorRow | null> {
  return getAll().find((c) => c.user_id === userId) ?? null
}

export async function getCreatorCampaigns(
  _creatorId: string
): Promise<(CampaignRow & { brand: BrandRow | null })[]> {
  return []
}

export async function getCreatorMatches(
  _creatorId: string
): Promise<(MatchRow & { brand: BrandRow })[]> {
  return []
}

export async function getAllCreators(): Promise<CreatorRow[]> {
  return getAll()
}

export async function createCreatorProfile(
  userId: string,
  handle: string,
  niche?: string
): Promise<CreatorRow> {
  const row: CreatorRow = {
    id: crypto.randomUUID(),
    user_id: userId,
    handle,
    niche: niche ?? null,
    followers: 0,
    bio: null,
    created_at: new Date().toISOString(),
  }
  saveAll([...getAll(), row])
  return row
}
