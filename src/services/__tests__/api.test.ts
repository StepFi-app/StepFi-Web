import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'
import type {
  AxiosAdapter,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { api, setSessionExpiredHandler } from '../api'
import { useUserStore } from '../../stores/user.store'

const originalAdapter = api.defaults.adapter

/**
 * Installs a working in-memory `localStorage` for the duration of a test.
 *
 * jsdom provides no `localStorage` here, and Node 24+ shadows it with a
 * getter-only global accessor that resolves to `undefined` unless the process
 * was started with `--localstorage-file`. Two consequences:
 *   - `vi.stubGlobal` cannot replace it (assignment to an accessor with no
 *     setter is silently ignored), and
 *   - zustand reads `window.localStorage` specifically (see `persistImpl` in
 *     zustand/middleware), not `globalThis.localStorage`, so `window` must be
 *     patched too.
 *
 * Returns a restore function for `afterEach`.
 */
function installMemoryStorage(): () => void {
  const makeStorage = () => {
    const store = new Map<string, string>()
    return {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, String(value)),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size
      },
    }
  }

  const targets: object[] = []
  const win = (globalThis as { window?: object }).window
  if (win) targets.push(win)
  targets.push(globalThis)

  const restores = targets.map((target) => {
    const original = Object.getOwnPropertyDescriptor(target, 'localStorage')
    Object.defineProperty(target, 'localStorage', {
      configurable: true,
      writable: true,
      value: makeStorage(),
    })
    return () => {
      if (original) {
        Object.defineProperty(target, 'localStorage', original)
      } else {
        Reflect.deleteProperty(target, 'localStorage')
      }
    }
  })

  return () => restores.forEach((restore) => restore())
}

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

describe('API response interceptor — unrecoverable session', () => {
  let restoreStorage: () => void

  beforeEach(() => {
    // This suite reaches `clearTokens()`, which writes to localStorage. The
    // environment does not provide a usable one (see installMemoryStorage).
    restoreStorage = installMemoryStorage()
    localStorage.clear()
    resetTokens()
  })

  afterEach(() => {
    setSessionExpiredHandler(null)
    restoreStorage()
    vi.restoreAllMocks()
  })

  it('clears the store and asks the router to redirect when there is no session to refresh', async () => {
    // No refresh token and no access token: nothing can be recovered.
    const onSessionExpired = vi.fn()
    setSessionExpiredHandler(onSessionExpired)
    useUserStore.setState({ accessToken: '', refreshToken: '', isAuthenticated: false })

    const rejected = api.interceptors.response.handlers?.[0]?.rejected
    const error = {
      config: { headers: {} },
      response: { status: 401 },
    } as unknown as AxiosError

    await expect(rejected!(error)).rejects.toBe(error)

    expect(onSessionExpired).toHaveBeenCalledTimes(1)
    expect(useUserStore.getState().isAuthenticated).toBe(false)
    // The in-memory store must be cleared, not just flagged unauthenticated.
    expect(useUserStore.getState().accessToken).toBe('')
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })

  it('clears the store and redirects when a refresh attempt fails', async () => {
    const onSessionExpired = vi.fn()
    setSessionExpiredHandler(onSessionExpired)
    useUserStore.getState().setTokens('stale-access', 'stale-refresh')
    // Refresh fails, so recovery is impossible from here.
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh rejected'))

    const rejected = api.interceptors.response.handlers?.[0]?.rejected
    const error = {
      config: { headers: {} },
      response: { status: 401 },
    } as unknown as AxiosError

    await expect(rejected!(error)).rejects.toBeTruthy()

    expect(onSessionExpired).toHaveBeenCalledTimes(1)
    expect(useUserStore.getState().accessToken).toBe('')
    expect(useUserStore.getState().refreshToken).toBe('')
    expect(localStorage.getItem('accessToken')).toBeNull()
  })

  it('clears the store but does not redirect an existing session that cannot be refreshed', async () => {
    // An expired session with an access token but no refresh token: the caller
    // should surface the 401 rather than having the page torn down underneath
    // the user. This preserves the behaviour the original guard documented.
    const onSessionExpired = vi.fn()
    setSessionExpiredHandler(onSessionExpired)
    useUserStore.setState({
      accessToken: 'expired-access',
      refreshToken: '',
      isAuthenticated: true,
    })

    const rejected = api.interceptors.response.handlers?.[0]?.rejected
    const error = {
      config: { headers: {} },
      response: { status: 401 },
    } as unknown as AxiosError

    await rejected!(error).catch(() => undefined)

    expect(onSessionExpired).not.toHaveBeenCalled()
    expect(useUserStore.getState().accessToken).toBe('')
  })

  it('does nothing when no handler has been registered', async () => {
    // Guards against the service hard-depending on a mounted router.
    setSessionExpiredHandler(null)

    const rejected = api.interceptors.response.handlers?.[0]?.rejected
    const error = {
      config: { headers: {} },
      response: { status: 401 },
    } as unknown as AxiosError

    await expect(rejected!(error)).rejects.toBe(error)
  })
})
