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

      // First-time users pick a role; returning users go straight
      // to their role-specific dashboard.
      const { role, roleSelected } = useRoleStore.getState()
      if (roleSelected && role) {
        navigate(ROLE_ROUTES[role])
      } else {
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
