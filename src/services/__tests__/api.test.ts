import { describe, it, expect, beforeEach } from 'vitest'

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
    } as any)
    expect(config.headers.Authorization).toBe('Bearer test-token')
  })

  it('does not add header when no token', async () => {
    const fulfilled = await getRequestHandler()
    const config = await fulfilled!({
      headers: {},
    } as any)
    expect(config.headers.Authorization).toBeUndefined()
  })
})
