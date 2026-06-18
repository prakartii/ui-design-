// Supabase is temporarily disabled. All data uses localStorage.
// To restore: uncomment the supabase block and remove the mock block.

/*
import { supabase } from '../lib/supabase'
import type { CampaignRow, LivingBriefRow, PixelPactRow } from '../types/database'

export async function getCampaignsByBrand(brandId: string): Promise<CampaignRow[]> {
  const { data, error } = await supabase
    .from('campaigns').select('*').eq('brand_id', brandId).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getCampaignsByCreator(creatorId: string): Promise<CampaignRow[]> {
  const { data, error } = await supabase
    .from('campaign_creators').select('campaign:campaigns(*)').eq('creator_id', creatorId)
  if (error) throw error
  return (data ?? []).map((r) => (r as unknown as { campaign: CampaignRow }).campaign)
}

export async function getLivingBriefs(campaignId: string): Promise<LivingBriefRow[]> {
  const { data, error } = await supabase
    .from('living_briefs').select('*').eq('campaign_id', campaignId).eq('is_active', true).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAllLivingBriefs(): Promise<LivingBriefRow[]> {
  const { data, error } = await supabase
    .from('living_briefs').select('*').eq('is_active', true).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getPixelPactByCreator(creatorId: string): Promise<PixelPactRow[]> {
  const { data, error } = await supabase
    .from('pixel_pact_verifications').select('*').eq('creator_id', creatorId).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getCampaignStats(brandId: string) {
  const campaigns = await getCampaignsByBrand(brandId)
  const active = campaigns.filter((c) => c.status === 'active').length
  const completed = campaigns.filter((c) => c.status === 'completed').length
  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget), 0)
  const spent = campaigns.filter((c) => c.status === 'completed').reduce((sum, c) => sum + Number(c.budget), 0)
  return { total: campaigns.length, active, completed, totalBudget, spent }
}
*/

import type { CampaignRow, LivingBriefRow, PixelPactRow } from '../types/database'

export async function getCampaignsByBrand(_brandId: string): Promise<CampaignRow[]> {
  return []
}

export async function getCampaignsByCreator(_creatorId: string): Promise<CampaignRow[]> {
  return []
}

export async function getLivingBriefs(_campaignId: string): Promise<LivingBriefRow[]> {
  return []
}

export async function getAllLivingBriefs(): Promise<LivingBriefRow[]> {
  return []
}

export async function getPixelPactByCreator(_creatorId: string): Promise<PixelPactRow[]> {
  return []
}

export async function getCampaignStats(_brandId: string) {
  return { total: 0, active: 0, completed: 0, totalBudget: 0, spent: 0 }
}
