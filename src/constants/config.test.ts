import { afterEach, describe, expect, it, vi } from 'vitest'

const DEFAULT_API_BASE_URL = 'https://stepfi-api.onrender.com/api/v1'

async function importConfig() {
  vi.resetModules()
  return import('./config')
}

describe('config', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses the live testnet API by default', async () => {
    vi.stubEnv('VITE_API_BASE_URL', undefined)

    const { API_BASE_URL } = await importConfig()

    expect(API_BASE_URL).toBe(DEFAULT_API_BASE_URL)
  })

  it('uses VITE_API_BASE_URL when provided', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000/api/v1')

    const { API_BASE_URL } = await importConfig()

    expect(API_BASE_URL).toBe('http://localhost:3000/api/v1')
  })
})
