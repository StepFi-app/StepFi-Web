import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WalletType } from '../types'
import { signTransaction } from '@stellar/freighter-api'

export interface WalletAdapter {
  sign: (unsignedXdr: string, networkPassphrase: string) => Promise<string>
}

export const freighterWalletAdapter: WalletAdapter = {
  async sign(unsignedXdr, networkPassphrase) {
    const response = await signTransaction(unsignedXdr, { networkPassphrase })
    if (response.error || !response.signedTxXdr) {
      throw new Error(response.error ? response.error.message : 'Transaction signing was rejected.')
    }
    return response.signedTxXdr
  },
}

interface WalletStore {
  address: string
  walletType: WalletType
  isConnected: boolean
  setWallet: (address: string, type: WalletType) => void
  disconnect: () => void
  getAdapter: () => WalletAdapter
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      address: '',
      walletType: null,
      isConnected: false,
      setWallet: (address, walletType) =>
        set({ address, walletType, isConnected: true }),
      disconnect: () =>
        set({
          address: '',
          walletType: null,
          isConnected: false,
        }),
      getAdapter: () => {
        const { walletType } = useWalletStore.getState()
        if (walletType === 'freighter') return freighterWalletAdapter
        throw new Error('The connected wallet does not support transaction signing yet.')
      },
    }),
    { name: 'stepfi-wallet' }
  )
)
