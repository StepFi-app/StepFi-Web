import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletStore } from '../stores/wallet.store'
import { useUserStore } from '../stores/user.store'
import { useRoleStore, ROLE_ROUTES } from '../stores/role.store'
import {
  isConnected,
  requestAccess,
} from '@stellar/freighter-api'
import { useAuth } from './useAuth'
import { usersService } from '../services/users.service'

export const useWallet = () => {
  const navigate = useNavigate()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const {
    address,
    walletType,
    isConnected: walletConnected,
    setWallet,
    disconnect,
  } = useWalletStore()

  const { isAuthenticated } = useUserStore()
  const { authenticate, logout } = useAuth()

  const connectFreighter = async () => {
    setIsConnecting(true)
    setConnectError(null)

    try {
      const connection = await isConnected()
      if (!connection.isConnected) {
        throw new Error(
          'Freighter not installed. Download at freighter.app'
        )
      }
      const access = await requestAccess()
      if (access.error) {
        throw new Error(access.error.message)
      }
      setWallet(access.address, 'freighter')

      await authenticate(access.address)

      // The role is wallet-bound and lives on the backend — read it from
      // GET /users/me rather than localStorage so reconnecting from any
      // browser or device lands on the correct dashboard.
      const { setRole, clearRole } = useRoleStore.getState()
      try {
        const me = await usersService.getMe()
        if (me.role) {
          setRole(me.role)
          navigate(ROLE_ROUTES[me.role])
        } else {
          clearRole()
          navigate('/role-select')
        }
      } catch {
        // Profile fetch failed (transient) — fall back to role selection;
        // a role that is already set is protected server-side (409) and
        // RoleSelect re-syncs from the backend in that case.
        clearRole()
        navigate('/role-select')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect'
      setConnectError(message)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    disconnect()
    logout()
  }

  return {
    address,
    walletType,
    isConnected: walletConnected,
    isAuthenticated,
    isConnecting,
    connectError,
    connectFreighter,
    disconnectWallet,
  }
}
