import { api } from './api'
import type { VouchRequest, ActiveVouch, UnsignedTransaction } from '../types'

/**
 * Backend DTO shapes (StepFi-API vouching module). The frontend view models
 * (VouchRequest / ActiveVouch) are richer than the API currently returns, so we
 * map defensively here — filling fields the API does not track with safe
 * defaults so the UI renders without runtime errors.
 */
interface VouchRequestItemDto {
  learnerWallet: string
  reputationScore: number
  requestedLoanAmount: number | null
  loanPurpose: string | null
  requestedAt: string
}

interface VouchResponseDto {
  id: string
  mentorWallet: string
  learnerWallet: string
  message?: string
  status: 'pending' | 'approved' | 'revoked' | 'expired'
  createdAt: string
  expiresAt: string
}

function deriveTier(score: number): VouchRequest['tier'] {
  if (score >= 90) return 'Gold'
  if (score >= 75) return 'Silver'
  if (score >= 60) return 'Bronze'
  return 'Starter'
}

function mapRequest(dto: VouchRequestItemDto): VouchRequest {
  return {
    id: dto.learnerWallet,
    learnerAddress: dto.learnerWallet,
    learnerWallet: dto.learnerWallet,
    score: dto.reputationScore,
    tier: deriveTier(dto.reputationScore),
    totalLoans: 0,
    activeLoans: 0,
    totalBorrowed: 0,
    totalRepaid: 0,
    loanAmount: dto.requestedLoanAmount ?? 0,
    purpose: dto.loanPurpose ?? '',
    requestedAt: dto.requestedAt,
    skills: [],
  }
}

function mapActiveVouch(dto: VouchResponseDto): ActiveVouch {
  return {
    id: dto.id,
    learnerAddress: dto.learnerWallet,
    learnerWallet: dto.learnerWallet,
    score: 0,
    tier: 'Starter',
    reputationBoost: 0,
    interestRateBefore: 0,
    interestRateAfter: 0,
    expiryDate: dto.expiresAt,
    repaymentStatus: 'current',
    createdAt: dto.createdAt,
    loanAmount: 0,
    paidAmount: 0,
    installments: 0,
    paidInstallments: 0,
  }
}

export const vouchingService = {
  // GET /vouching/requests — pending requests to the authenticated mentor.
  getVouchRequests: async (): Promise<VouchRequest[]> => {
    const res = await api.get<VouchRequestItemDto[]>('/vouching/requests')
    return (res.data ?? []).map(mapRequest)
  },

  // GET /vouching/mentor — vouches the authenticated mentor has given.
  getMyVouches: async (): Promise<ActiveVouch[]> => {
    const res = await api.get<VouchResponseDto[]>('/vouching/mentor')
    return (res.data ?? []).filter((v) => v.status === 'approved').map(mapActiveVouch)
  },

  // POST /vouching/approve — mentor approves a pending vouch request for a learner.
  buildVouch: async (learnerAddress: string): Promise<UnsignedTransaction<{ learnerAddress: string }>> => {
    const res = await api.post('/vouching/approve', {
      learnerWallet: learnerAddress,
    })
    return res.data.data
  },

  declineVouch: async (learnerAddress: string): Promise<void> => {
    await api.post('/vouching/decline', { learnerWallet: learnerAddress })
  },

  // DELETE /vouching/:id — mentor revokes a vouch they created.
  revokeVouch: async (id: string): Promise<void> => {
    await api.delete(`/vouching/${id}`)
  },
}
