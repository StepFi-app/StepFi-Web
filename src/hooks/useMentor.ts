import { useQuery } from '@tanstack/react-query'
import { useWalletStore } from '../stores/wallet.store'
import { vouchingService } from '../services/vouching.service'
import { reputationService } from '../services/reputation.service'
import { queryKeys } from '../services/queryKeys'
import type { ReputationScore } from '../types'

function deriveTier(score: number): ReputationScore['tier'] {
  if (score >= 90) return 'Gold'
  if (score >= 75) return 'Silver'
  if (score >= 60) return 'Bronze'
  return 'Starter'
}

export function useMentor() {
  const address = useWalletStore((s) => s.address)

  const reputationQuery = useQuery({
    queryKey: queryKeys.reputation.score(address ?? ''),
    queryFn: async () => {
      if (!address) return null
      const res = await reputationService.getScore(address)
      return res as ReputationScore
    },
    enabled: !!address,
  })

  const requestsQuery = useQuery({
    queryKey: queryKeys.vouches.requests(),
    queryFn: vouchingService.getVouchRequests,
  })

  const activeVouchesQuery = useQuery({
    queryKey: queryKeys.vouches.myVouches(),
    queryFn: vouchingService.getMyVouches,
  })

  const score = reputationQuery.data?.score ?? 0
  const tier = reputationQuery.data?.tier ?? deriveTier(score)
  const totalVouchesGiven = activeVouchesQuery.data?.length ?? 0
  const activeVouchCount = activeVouchesQuery.data?.filter(
    (v) => v.repaymentStatus === 'current'
  ).length ?? 0
  const atRiskCount = activeVouchesQuery.data?.filter(
    (v) => v.repaymentStatus === 'late' || v.repaymentStatus === 'defaulted'
  ).length ?? 0
  const totalLoanImpact = (activeVouchesQuery.data ?? []).reduce(
    (sum, v) => sum + v.loanAmount,
    0
  )

  return {
    address,
    score,
    tier,
    totalVouchesGiven,
    activeVouchCount,
    atRiskCount,
    totalLoanImpact,
    requests: requestsQuery.data ?? [],
    activeVouches: activeVouchesQuery.data ?? [],
    isLoadingReputation: reputationQuery.isLoading,
    isLoadingRequests: requestsQuery.isLoading,
    isLoadingActiveVouches: activeVouchesQuery.isLoading,
    isErrorReputation: reputationQuery.isError,
    isErrorRequests: requestsQuery.isError,
    isErrorActiveVouches: activeVouchesQuery.isError,
    refetchRequests: requestsQuery.refetch,
    refetchActiveVouches: activeVouchesQuery.refetch,
  }
}
