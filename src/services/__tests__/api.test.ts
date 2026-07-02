import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('API interceptors', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds Authorization header when token exists', async () => {
    localStorage.setItem('accessToken', 'test-token')
    const { api } = await import('../api')
    const config = await api.interceptors.request.handlers[0].fulfilled({
      headers: {},
    } as any)
    expect(config.headers.Authorization).toBe('Bearer test-token')
  })

  it('does not add header when no token', async () => {
    const { api } = await import('../api')
    const config = await api.interceptors.request.handlers[0].fulfilled({
      headers: {},
    } as any)
    expect(config.headers.Authorization).toBeUndefined()
  })
})
