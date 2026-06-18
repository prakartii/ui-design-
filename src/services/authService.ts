// Supabase auth is temporarily disabled. All auth uses localStorage.
// To restore Supabase auth: uncomment the supabase block and remove the mock block.

/*
import { supabase } from '../lib/supabase'

export async function signUp({ name, email, password, role }: AuthSignUpPayload) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
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
*/

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

const USERS_KEY = 'mock_users'
const SESSION_KEY = 'mock_session'

interface StoredUser {
  id: string
  name: string
  email: string
  role: 'creator' | 'brand'
  password: string
}

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export async function signUp({ name, email, password, role }: AuthSignUpPayload) {
  const users = getStoredUsers()
  if (users.find((u) => u.email === email)) throw new Error('Email already registered')
  const user: StoredUser = { id: crypto.randomUUID(), name, email, password, role }
  saveStoredUsers([...users, user])
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user }))
  return { user: { id: user.id, email: user.email } }
}

export async function signIn({ email, password }: AuthSignInPayload) {
  const users = getStoredUsers()
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) throw new Error('Invalid email or password')
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user }))
  return { user: { id: user.id, email: user.email } }
}

export async function signOut() {
  localStorage.removeItem(SESSION_KEY)
}

export async function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function loadUserProfile(userId: string): Promise<UserRow | null> {
  const users = getStoredUsers()
  const u = users.find((u) => u.id === userId)
  if (!u) return null
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar_url: null,
    created_at: new Date().toISOString(),
  }
}

export function onAuthStateChange(callback: (userId: string | null) => void) {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    const session = raw ? JSON.parse(raw) : null
    callback(session?.user?.id ?? null)
  } catch {
    callback(null)
  }
  return { unsubscribe: () => {} }
}
