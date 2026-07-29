import { api } from './api'
import type {
  MySummary,
  PoolInfo,
  UnsignedTransaction,
  DepositPreview,
  WithdrawPreview,
} from '../types'

export const sponsorsService = {
  getPoolInfo: async (): Promise<PoolInfo> => {
    const res = await api.get('/liquidity/overview')
    return res.data.data
  },

  getMySummary: async (): Promise<MySummary> => {
    const res = await api.get('/liquidity/my-summary')
    return res.data.data
  },

  deposit: async (amount: number): Promise<UnsignedTransaction<DepositPreview>> => {
    const res = await api.post('/liquidity/deposit', { amount })
    return res.data.data
  },

  withdraw: async (shares: number): Promise<UnsignedTransaction<WithdrawPreview>> => {
    const res = await api.post('/liquidity/withdraw', { shares })
    return res.data.data
  },
}
