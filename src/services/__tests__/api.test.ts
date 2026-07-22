import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'
import type {
  AxiosAdapter,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { api } from '../api'
import { useUserStore } from '../../stores/user.store'

const originalAdapter = api.defaults.adapter

function resetTokens() {
  useUserStore.setState({ accessToken: '', refreshToken: '', isAuthenticated: false })
}

describe('API request interceptor', () => {
  beforeEach(() => {
    localStorage.clear()
    resetTokens()
  })

  function getRequestHandler() {
    return api.interceptors.request.handlers?.[0]?.fulfilled
  }

  it('adds the Authorization header from the access token in the store', () => {
    useUserStore.setState({ accessToken: 'test-token', isAuthenticated: true })
    const fulfilled = getRequestHandler()
    const config = fulfilled!({
      headers: {},
    } as unknown as InternalAxiosRequestConfig) as InternalAxiosRequestConfig
    expect(config.headers.Authorization).toBe('Bearer test-token')
  })

  it('does not add an Authorization header when the store has no token', () => {
    const fulfilled = getRequestHandler()
    const config = fulfilled!({
      headers: {},
    } as unknown as InternalAxiosRequestConfig) as InternalAxiosRequestConfig
    expect(config.headers.Authorization).toBeUndefined()
  })
})

describe('API response interceptor — refresh keeps the store in sync', () => {
  beforeEach(() => {
    localStorage.clear()
    resetTokens()
    // The interceptor retries the original request via `api(originalRequest)`.
    // Stub the adapter so retries resolve without touching the network.
    api.defaults.adapter = (async (config: InternalAxiosRequestConfig) =>
      ({
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse)) as AxiosAdapter
  })

  afterEach(() => {
    api.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  function triggerUnauthorized() {
    const rejected = api.interceptors.response.handlers?.[0]?.rejected
    const error = {
      config: { headers: {} },
      response: { status: 401 },
    } as unknown as AxiosError
    return rejected!(error)
  }

  // Regression: single-use refresh tokens are rotated on every refresh.
  // A refresh must therefore read the *latest* refresh token from the store.
  // Previously the interceptor wrote the rotated token to localStorage only,
  // leaving the store holding a stale token — so the next refresh sent the
  // already-consumed token and got a 401. This exercises exactly that flow:
  // two consecutive expiries, and asserts the second uses the rotated token.
  it('uses the rotated refresh token from the store on a second refresh, never a stale one', async () => {
    useUserStore.getState().setTokens('access-1', 'refresh-1')

    const sentRefreshTokens: string[] = []
    let counter = 1
    vi.spyOn(axios, 'post').mockImplementation(((
      _url: string,
      body: { refreshToken: string },
    ) => {
      sentRefreshTokens.push(body.refreshToken)
      counter += 1
      return Promise.resolve({
        data: { accessToken: `access-${counter}`, refreshToken: `refresh-${counter}` },
      } as AxiosResponse)
    }) as unknown as typeof axios.post)

    // First expiry: interceptor refreshes with refresh-1 and rotates the
    // store to refresh-2 (and the access token to access-2).
    await triggerUnauthorized()
    expect(sentRefreshTokens).toEqual(['refresh-1'])
    expect(useUserStore.getState().accessToken).toBe('access-2')
    expect(useUserStore.getState().refreshToken).toBe('refresh-2')

    // Second expiry shortly after: the interceptor must read refresh-2 from
    // the store — not the stale refresh-1 — and rotate to refresh-3.
    await triggerUnauthorized()
    expect(sentRefreshTokens).toEqual(['refresh-1', 'refresh-2'])
    expect(useUserStore.getState().accessToken).toBe('access-3')
    expect(useUserStore.getState().refreshToken).toBe('refresh-3')
  })
})
