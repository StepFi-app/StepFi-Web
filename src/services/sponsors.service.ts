import { api } from './api'
import type { PoolInfo } from '../types'

export const sponsorsService = {
  getPoolInfo: async (): Promise<PoolInfo> => {
    const res = await api.get('/liquidity/overview')
    const d = res.data?.data ?? res.data
    return {
      totalLiquidity: d.totalLiquidity ?? 0,
      totalDeposits: d.totalLiquidity ?? 0,
      totalShares: d.totalShares ?? 0,
      sharePrice: d.sharePrice ?? 1,
      availableLiquidity: d.totalLiquidity ?? 0,
      lockedLiquidity: d.lockedLiquidity ?? 0,
      apy: d.apy ?? 0,
    }
  },

  deposit: async (amount: number) => {
    const res = await api.post('/liquidity/deposit', { amount })
    return res.data
  },

  withdraw: async (shares: number): Promise<{ xdr: string }> => {
    const res = await api.post('/liquidity/withdraw', { shares })
    return res.data
  },

  submitTransaction: async (signedXdr: string): Promise<{
    hash: string
    amount: number
    profit: number
  }> => {
    const res = await api.post('/liquidity/submit', { xdr: signedXdr })
    return res.data
  },
}
