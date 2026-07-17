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
        useUserStore.getState().clearTokens()
        // Only force-redirect users who were never authenticated.
        // If a token existed (e.g. expired session with no refresh
        // token), let the caller surface the error instead of
        // tearing the page down.
        if (!existingAccessToken) {
          window.location.href = '/'
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
        useUserStore.getState().clearTokens()
        window.location.href = '/'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
