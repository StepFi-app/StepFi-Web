import axios from 'axios'
import { API_BASE_URL } from '../constants/config'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '../stores/user.store'

interface FailedRequest {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: FailedRequest[] = []

/**
 * Called when the session can no longer be recovered and the user has to be
 * sent back through the login flow.
 *
 * This is injected rather than performed here because `api` is a plain module:
 * it cannot call `useNavigate`, and assigning `window.location` would trigger a
 * full document reload that throws away all React and store state. The router
 * registers the real handler at startup (see `setSessionExpiredHandler` in
 * `src/router/index.tsx`), which navigates declaratively instead.
 */
let sessionExpiredHandler: (() => void) | null = null

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler
}

function notifySessionExpired(): void {
  sessionExpiredHandler?.()
}

function endSession(): void {
  // Clear the store first so in-memory auth state and its persisted copy are
  // gone before anything navigates away from the current route.
  useUserStore.getState().clearTokens()
  notifySessionExpired()
}

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// useUserStore is the single source of truth for auth tokens. localStorage
// is only a persistence layer, written exclusively through the store's
// setTokens/clearTokens. Application code — including this interceptor —
// must never read or write the token keys in localStorage directly, or the
// in-memory store and localStorage can drift apart. That drift was the root
// cause of the intermittent 401: a refresh rotated the token in localStorage
// but left the store holding the now-invalid one.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useUserStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const { accessToken: existingAccessToken, refreshToken } = useUserStore.getState()
      if (!refreshToken) {
        isRefreshing = false
        // Only sign users out when there was no authenticated session to
        // preserve. If a token existed (e.g. an expired session with no refresh
        // token), let the caller surface the error instead of tearing the page
        // down.
        if (!existingAccessToken) {
          endSession()
        } else {
          useUserStore.getState().clearTokens()
        }
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = res.data

        // Route the write through the store so the in-memory tokens and
        // their localStorage copy stay in lockstep. The next refresh then
        // reads the rotated token from the store, never a stale copy.
        useUserStore.getState().setTokens(accessToken, newRefreshToken)

        processQueue(null, accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        endSession()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
