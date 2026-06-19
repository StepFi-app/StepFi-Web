import { api } from './api'
import type { PoolInfo } from '../types'

export const poolService = {
  getPoolInfo: async (): Promise<PoolInfo> => {
    const res = await api.get('/pool')
    return res.data
  },
}
