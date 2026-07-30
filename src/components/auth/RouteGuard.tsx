import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useWallet } from '../../hooks/useWallet'
import { useAuth } from '../../hooks/useAuth'
import { useRoleStore, type UserRole } from '../../stores/role.store'
import type { ReactNode } from 'react'

interface RouteGuardProps {
  children: ReactNode
  allowedRole?: UserRole
  requireAuth?: boolean
}

export function RouteGuard({
  children,
  allowedRole,
  requireAuth = true,
}: RouteGuardProps) {
  const { isConnected } = useWallet()
  const { checkAuth, logout } = useAuth()
  const { role, roleSelected } = useRoleStore()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const validateAuth = () => {
      setIsChecking(true)
      
      if (!requireAuth) {
        setIsAuthenticated(true)
        setIsChecking(false)
        return
      }

      // Check wallet connection
      if (!isConnected) {
        setIsAuthenticated(false)
        setIsChecking(false)
        return
      }

      // Check JWT token validity
      const isValid = checkAuth()
      if (!isValid) {
        logout()
        setIsAuthenticated(false)
        setIsChecking(false)
        return
      }

      setIsAuthenticated(true)
      setIsChecking(false)
    }

    validateAuth()
  }, [isConnected, checkAuth, logout, requireAuth])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Redirect unauthenticated users
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Redirect if wallet not connected
  if (requireAuth && !isConnected) {
    return <Navigate to="/" replace />
  }

  // Redirect if role not selected
  if (requireAuth && !roleSelected) {
    return <Navigate to="/role-select" replace />
  }

  // Redirect if role doesn't match requirement
  if (requireAuth && allowedRole && role !== allowedRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
