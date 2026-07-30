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

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp
    if (!exp) return false
    return Date.now() >= exp * 1000
  } catch {
    return true
  }
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

  const checkAuth = () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return false
    }
    if (isTokenExpired(token)) {
      clearTokens()
      return false
    }
    return true
  }

  return {
    authenticate,
    logout,
    checkAuth,
    isAuthLoading,
    authError,
    isAuthenticated,
  }
}
