export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'creator' | 'brand'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role: 'creator' | 'brand'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'creator' | 'brand'
          avatar_url?: string | null
          created_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          user_id: string | null
          name: string
          industry: string | null
          description: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          industry?: string | null
          description?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          industry?: string | null
          description?: string | null
          logo_url?: string | null
          created_at?: string
        }
      }
      creators: {
        Row: {
          id: string
          user_id: string | null
          handle: string | null
          niche: string | null
          followers: number
          bio: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          handle?: string | null
          niche?: string | null
          followers?: number
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          handle?: string | null
          niche?: string | null
          followers?: number
          bio?: string | null
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          brand_id: string
          title: string
          brief: string | null
          status: 'draft' | 'active' | 'completed' | 'paused'
          budget: number
          currency: string
          deadline: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          title: string
          brief?: string | null
          status?: 'draft' | 'active' | 'completed' | 'paused'
          budget?: number
          currency?: string
          deadline?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          title?: string
          brief?: string | null
          status?: 'draft' | 'active' | 'completed' | 'paused'
          budget?: number
          currency?: string
          deadline?: string | null
          created_at?: string
        }
      }
      campaign_creators: {
        Row: {
          id: string
          campaign_id: string
          creator_id: string
          status: 'active' | 'review' | 'completed' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          creator_id: string
          status?: 'active' | 'review' | 'completed' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          creator_id?: string
          status?: 'active' | 'review' | 'completed' | 'rejected'
          created_at?: string
        }
      }
      creator_brand_matches: {
        Row: {
          id: string
          creator_id: string
          brand_id: string
          compatibility_score: number
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          brand_id: string
          compatibility_score: number
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          brand_id?: string
          compatibility_score?: number
          created_at?: string
        }
      }
      brief_translations: {
        Row: {
          id: string
          campaign_id: string
          creator_id: string
          original_brief: string
          translated_brief: Json | null
          match_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          creator_id: string
          original_brief: string
          translated_brief?: Json | null
          match_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          creator_id?: string
          original_brief?: string
          translated_brief?: Json | null
          match_score?: number | null
          created_at?: string
        }
      }
      risk_reviews: {
        Row: {
          id: string
          creator_id: string
          campaign_id: string | null
          content_text: string
          risk_score: number
          feedback: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          campaign_id?: string | null
          content_text: string
          risk_score: number
          feedback?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          campaign_id?: string | null
          content_text?: string
          risk_score?: number
          feedback?: Json | null
          created_at?: string
        }
      }
      living_briefs: {
        Row: {
          id: string
          campaign_id: string
          signal_type: 'new' | 'update' | 'alert'
          description: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          signal_type: 'new' | 'update' | 'alert'
          description: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          signal_type?: 'new' | 'update' | 'alert'
          description?: string
          is_active?: boolean
          created_at?: string
        }
      }
      pixel_pact_verifications: {
        Row: {
          id: string
          campaign_id: string
          creator_id: string
          status: 'pending' | 'verified' | 'failed' | 'partial'
          payment_amount: number
          verification_report: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          creator_id: string
          status?: 'pending' | 'verified' | 'failed' | 'partial'
          payment_amount?: number
          verification_report?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          creator_id?: string
          status?: 'pending' | 'verified' | 'failed' | 'partial'
          payment_amount?: number
          verification_report?: Json | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience row types
export type UserRow = Database['public']['Tables']['users']['Row']
export type BrandRow = Database['public']['Tables']['brands']['Row']
export type CreatorRow = Database['public']['Tables']['creators']['Row']
export type CampaignRow = Database['public']['Tables']['campaigns']['Row']
export type CampaignCreatorRow = Database['public']['Tables']['campaign_creators']['Row']
export type MatchRow = Database['public']['Tables']['creator_brand_matches']['Row']
export type BriefTranslationRow = Database['public']['Tables']['brief_translations']['Row']
export type RiskReviewRow = Database['public']['Tables']['risk_reviews']['Row']
export type LivingBriefRow = Database['public']['Tables']['living_briefs']['Row']
export type PixelPactRow = Database['public']['Tables']['pixel_pact_verifications']['Row']
