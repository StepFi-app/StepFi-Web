import { useState } from 'react'
import { signMessage } from '@stellar/freighter-api'
import { authService } from '../services/auth.service'
import { useUserStore } from '../stores/user.store'

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export const useAuth = () => {
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const { setTokens, isAuthenticated, clearTokens } = useUserStore()

  const authenticate = async (address: string) => {
    setIsAuthLoading(true)
    setAuthError(null)

    try {
      const nonceRes = await authService.getNonce(address)
      const nonce: string = nonceRes.nonce ?? nonceRes

      const signed = await signMessage(nonce, { address })
      if (signed.error || !signed.signedMessage) {
        throw new Error(signed.error?.message || 'Failed to sign message')
      }

      const { signedMessage } = signed
      const signature = typeof signedMessage === 'string'
        ? signedMessage
        : bytesToBase64(new Uint8Array(signedMessage as unknown as ArrayBufferLike))

      const verifyRes = await authService.verify(address, nonce, signature)
      setTokens(verifyRes.accessToken, verifyRes.refreshToken)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      setAuthError(message)
      throw err
    } finally {
      setIsAuthLoading(false)
    }
  }

  const logout = () => {
    clearTokens()
  }

  return {
    authenticate,
    logout,
    isAuthLoading,
    authError,
    isAuthenticated,
  }
}
