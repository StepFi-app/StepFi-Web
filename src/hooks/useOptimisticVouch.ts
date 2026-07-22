import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vouchingService } from '../services/vouching.service'
import { queryKeys, invalidateSubtree } from '../services/queryKeys'
import type { VouchRequest, ActiveVouch } from '../types'

interface SubmitVouchParams {
  learnerAddress: string
  txHash?: string
}

export function useSubmitVouch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ learnerAddress, txHash }: SubmitVouchParams) =>
      vouchingService.submitVouch(learnerAddress, txHash),
    onMutate: async ({ learnerAddress }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.vouches.requests() })
      await queryClient.cancelQueries({ queryKey: queryKeys.vouches.myVouches() })

      const previousRequests = queryClient.getQueryData<VouchRequest[]>(
        queryKeys.vouches.requests()
      )
      const previousVouches = queryClient.getQueryData<ActiveVouch[]>(
        queryKeys.vouches.myVouches()
      )

      if (previousRequests) {
        queryClient.setQueryData<VouchRequest[]>(
          queryKeys.vouches.requests(),
          previousRequests.filter((req) => req.learnerAddress !== learnerAddress)
        )
      }

      return { previousRequests, previousVouches }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(queryKeys.vouches.requests(), context.previousRequests)
      }
      if (context?.previousVouches) {
        queryClient.setQueryData(queryKeys.vouches.myVouches(), context.previousVouches)
      }
    },
    onSettled: () => {
      invalidateSubtree.vouches(queryClient)
      invalidateSubtree.reputation(queryClient)
    },
  })
}

export function useRevokeVouch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => vouchingService.revokeVouch(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.vouches.myVouches() })

      const previousVouches = queryClient.getQueryData<ActiveVouch[]>(
        queryKeys.vouches.myVouches()
      )

      if (previousVouches) {
        queryClient.setQueryData<ActiveVouch[]>(
          queryKeys.vouches.myVouches(),
          previousVouches.filter((vouch) => vouch.id !== id)
        )
      }

      return { previousVouches }
    },
    onError: (_err, _id, context) => {
      if (context?.previousVouches) {
        queryClient.setQueryData(queryKeys.vouches.myVouches(), context.previousVouches)
      }
    },
    onSettled: () => {
      invalidateSubtree.vouches(queryClient)
    },
  })
}
