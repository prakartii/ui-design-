// Supabase is temporarily disabled — no env vars required.
// To re-enable: uncomment the block below, remove the mock export,
// and add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to your .env file.

/*
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
*/

export const SUPABASE_ENABLED = false
