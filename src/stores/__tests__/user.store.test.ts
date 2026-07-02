import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore } from '../user.store'

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      accessToken: '',
      refreshToken: '',
      isAuthenticated: false,
    })
    localStorage.clear()
  })

  it('starts unauthenticated', () => {
    const state = useUserStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBe('')
  })

  it('setTokens authenticates user', () => {
    useUserStore.getState().setTokens('access123', 'refresh123')
    const state = useUserStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.accessToken).toBe('access123')
    expect(state.refreshToken).toBe('refresh123')
  })

  it('clearTokens logs user out', () => {
    useUserStore.getState().setTokens('access123', 'refresh123')
    useUserStore.getState().clearTokens()
    const state = useUserStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBe('')
  })
})
