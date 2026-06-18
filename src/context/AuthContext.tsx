import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, UserRole } from '../types'
import {
  signUp,
  signIn,
  signOut,
  getSession,
  loadUserProfile,
  onAuthStateChange,
} from '../services/authService'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Build our User shape from the DB row
  async function resolveUser(userId: string): Promise<User | null> {
    const profile = await loadUserProfile(userId)
    if (!profile) return null
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as UserRole,
    }
  }

  // Bootstrap: check for an existing session on mount
  useEffect(() => {
    getSession().then(async (session) => {
      if (session?.user) {
        const resolved = await resolveUser(session.user.id)
        setUser(resolved)
      }
      setIsLoading(false)
    })

    // Keep in sync with auth state changes (login / logout in another tab)
    const subscription = onAuthStateChange(async (userId) => {
      if (userId) {
        const resolved = await resolveUser(userId)
        setUser(resolved)
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signup = useCallback(
    async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
      const { user: authUser } = await signUp({ name, email, password, role })
      if (!authUser) throw new Error('Signup returned no user')

      // The trigger will create the DB profile asynchronously.
      // Poll briefly so we can return a resolved User.
      let profile = await loadUserProfile(authUser.id)
      if (!profile) {
        await new Promise((r) => setTimeout(r, 800))
        profile = await loadUserProfile(authUser.id)
      }

      const resolved: User = {
        id: authUser.id,
        name,
        email,
        role,
      }
      setUser(resolved)
      return resolved
    },
    [],
  )

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const { user: authUser } = await signIn({ email, password })
    if (!authUser) throw new Error('Login returned no user')
    const resolved = await resolveUser(authUser.id)
    if (!resolved) throw new Error('User profile not found')
    setUser(resolved)
    return resolved
  }, [])

  const logout = useCallback(async () => {
    await signOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>')
  return ctx
}
