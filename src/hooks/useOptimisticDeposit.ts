import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsService } from '../services/transactions.service'
import { queryKeys, invalidateSubtree } from '../services/queryKeys'
import type { PoolInfo } from '../types'

export function useOptimisticDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      signedXdr,
      depositAmount,
    }: {
      signedXdr: string
      depositAmount: number
    }) => {
      const submitted = await transactionsService.submit(signedXdr, 'deposit')
      return { submitted, depositAmount }
    },
    onMutate: async ({ depositAmount }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.pool.info() })

      const previousPoolInfo = queryClient.getQueryData<PoolInfo>(queryKeys.pool.info())

      if (previousPoolInfo) {
        queryClient.setQueryData<PoolInfo>(queryKeys.pool.info(), {
          ...previousPoolInfo,
          totalDeposits: previousPoolInfo.totalDeposits + depositAmount,
          totalLiquidity: previousPoolInfo.totalLiquidity + depositAmount,
          availableLiquidity: previousPoolInfo.availableLiquidity + depositAmount,
        })
      }

      return { previousPoolInfo }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPoolInfo) {
        queryClient.setQueryData(queryKeys.pool.info(), context.previousPoolInfo)
      }
    },
    onSettled: () => {
      invalidateSubtree.pool(queryClient)
      invalidateSubtree.loans(queryClient)
    },
  })
}

export function useOptimisticWithdraw() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      signedXdr,
      expectedAmount,
    }: {
      signedXdr: string
      expectedAmount: number
    }) => {
      const submitted = await transactionsService.submit(signedXdr, 'withdraw')
      return { submitted, expectedAmount }
    },
    onMutate: async ({ expectedAmount }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.pool.info() })

      const previousPoolInfo = queryClient.getQueryData<PoolInfo>(queryKeys.pool.info())

      if (previousPoolInfo) {
        queryClient.setQueryData<PoolInfo>(queryKeys.pool.info(), {
          ...previousPoolInfo,
          totalLiquidity: Math.max(0, previousPoolInfo.totalLiquidity - expectedAmount),
          availableLiquidity: Math.max(0, previousPoolInfo.availableLiquidity - expectedAmount),
        })
      }

      return { previousPoolInfo }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPoolInfo) {
        queryClient.setQueryData(queryKeys.pool.info(), context.previousPoolInfo)
      }
    },
    onSettled: () => {
      invalidateSubtree.pool(queryClient)
    },
  })
}
