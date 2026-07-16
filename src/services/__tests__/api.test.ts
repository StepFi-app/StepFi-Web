import { describe, it, expect, beforeEach } from 'vitest'
import type { InternalAxiosRequestConfig } from 'axios'

describe('API interceptors', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  async function getRequestHandler() {
    const { api } = await import('../api')
    const handler = api.interceptors.request.handlers?.[0]
    return handler?.fulfilled
  }

  it('adds Authorization header when token exists', async () => {
    localStorage.setItem('accessToken', 'test-token')
    const fulfilled = await getRequestHandler()
    const config = await fulfilled!({
      headers: {},
    } as unknown as InternalAxiosRequestConfig)
    expect(config.headers.Authorization).toBe('Bearer test-token')
  })

  it('does not add header when no token', async () => {
    const fulfilled = await getRequestHandler()
    const config = await fulfilled!({
      headers: {},
    } as unknown as InternalAxiosRequestConfig)
    expect(config.headers.Authorization).toBeUndefined()
  })
})
