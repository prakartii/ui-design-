import type { User, UserRole } from '../types'

const CURRENT_USER_KEY = 'intent_current_user'
const ALL_USERS_KEY = 'intent_users'

function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(ALL_USERS_KEY)
    return raw ? (JSON.parse(raw) as User[]) : []
  } catch {
    return []
  }
}

function writeUsers(users: User[]): void {
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users))
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function persistCurrentUser(user: User): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

export function signup(name: string, email: string, _password: string, role: UserRole): User {
  const users = readUsers()
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.')
  }
  const user: User = { id: crypto.randomUUID(), name, email, role }
  writeUsers([...users, user])
  persistCurrentUser(user)
  return user
}

export function login(email: string, _password: string): User {
  const users = readUsers()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    throw new Error('No account found with this email. Please sign up first.')
  }
  persistCurrentUser(user)
  return user
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY)
}
