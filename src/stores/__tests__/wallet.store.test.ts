import { describe, it, expect, beforeEach } from 'vitest'
import { useWalletStore } from '../wallet.store'

describe('useWalletStore', () => {
  beforeEach(() => {
    useWalletStore.setState({
      address: '',
      walletType: null,
      isConnected: false,
    })
  })

  it('starts disconnected', () => {
    const state = useWalletStore.getState()
    expect(state.isConnected).toBe(false)
    expect(state.address).toBe('')
    expect(state.walletType).toBeNull()
  })

  it('setWallet updates state correctly', () => {
    useWalletStore.getState().setWallet('GCBMQ...4X7F', 'freighter')
    const state = useWalletStore.getState()
    expect(state.isConnected).toBe(true)
    expect(state.address).toBe('GCBMQ...4X7F')
    expect(state.walletType).toBe('freighter')
  })

  it('disconnect resets state', () => {
    useWalletStore.getState().setWallet('GCBMQ...4X7F', 'freighter')
    useWalletStore.getState().disconnect()
    const state = useWalletStore.getState()
    expect(state.isConnected).toBe(false)
    expect(state.address).toBe('')
    expect(state.walletType).toBeNull()
  })
})
