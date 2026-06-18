import { supabase } from '../lib/supabase'
import type { UserRow } from '../types/database'

export interface AuthSignUpPayload {
  name: string
  email: string
  password: string
  role: 'creator' | 'brand'
}

export interface AuthSignInPayload {
  email: string
  password: string
}

export async function signUp({ name, email, password, role }: AuthSignUpPayload) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }: AuthSignInPayload) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function loadUserProfile(userId: string): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export function onAuthStateChange(callback: (userId: string | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user?.id ?? null)
  })
  return data.subscription
}
