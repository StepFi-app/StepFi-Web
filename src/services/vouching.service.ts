import { api } from './api'
import type { VouchRequest, ActiveVouch, VouchResponse } from '../types'

export const vouchingService = {
  getVouchRequests: async () => {
    const res = await api.get<VouchRequest[]>('/vouching/requests')
    return res.data
  },

  getMyVouches: async () => {
    const res = await api.get<ActiveVouch[]>('/vouching/given')
    return res.data
  },

  submitVouch: async (learnerAddress: string, txHash: string) => {
    const res = await api.post<VouchResponse>('/vouching', {
      learnerAddress,
      txHash,
    })
    return res.data
  },

  revokeVouch: async (id: string) => {
    const res = await api.delete<void>(`/vouching/${id}`)
    return res.data
  },
}
