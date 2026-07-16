import { Navigate } from 'react-router-dom'
import { useRoleStore } from '../stores/role.store'
import { useWallet } from '../hooks/useWallet'

export function Dashboard() {
  const { isConnected } = useWallet()
  const { role, roleSelected } = useRoleStore()

  if (!isConnected) {
    return <Navigate to="/" replace />
  }

  if (!roleSelected) {
    return <Navigate to="/role-select" replace />
  }

  if (role === 'sponsor') {
    return <Navigate to="/sponsors" replace />
  }

  if (role === 'vendor') {
    return <Navigate to="/vendors/dashboard" replace />
  }

  if (role === 'mentor') {
    return <Navigate to="/vouch" replace />
  }

  return <Navigate to="/role-select" replace />
}
