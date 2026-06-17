import { api } from './api'
import type { PoolInfo } from '../types'

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
}
