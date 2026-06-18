import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types'

interface Props {
  children: React.ReactNode
  allowedRole?: UserRole
}

export function ProtectedRoute({ children, allowedRole }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRole && user?.role !== allowedRole) {
    const fallback = user?.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
