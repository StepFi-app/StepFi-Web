import { api } from './api'
import type { PoolInfo, SponsorAnalytics } from '../types'

export const sponsorsService = {
  getPoolInfo: async (): Promise<PoolInfo> => {
    const res = await api.get('/liquidity/pool-info')
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

  getAnalytics: async (startDate?: string, endDate?: string): Promise<SponsorAnalytics> => {
    const params: Record<string, string> = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    const res = await api.get('/liquidity/analytics', { params })
    return res.data
  },
}
