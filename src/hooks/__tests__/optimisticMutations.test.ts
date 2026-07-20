import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, createElement } from 'react'
import { useSubmitVouch } from '../useOptimisticVouch'
import { useAddProduct, useUpdateProduct } from '../useOptimisticProduct'
import { queryKeys } from '../../services/queryKeys'
import type { VouchRequest, VendorProduct } from '../../types'

vi.mock('../../services/vouching.service', () => ({
  vouchingService: {
    submitVouch: vi.fn().mockImplementation((learnerAddress: string) => {
      if (learnerAddress === 'FAIL_ADDRESS') {
        return Promise.reject(new Error('Vouch failed'))
      }
      return Promise.resolve({ id: 'v1', status: 'approved' })
    }),
    revokeVouch: vi.fn().mockImplementation((id: string) => {
      if (id === 'FAIL_ID') {
        return Promise.reject(new Error('Revoke failed'))
      }
      return Promise.resolve()
    }),
  },
}))

vi.mock('../../services/vendors.service', () => ({
  vendorsService: {
    createProduct: vi.fn().mockImplementation((prod: { name: string; price: number }) => {
      if (prod.name === 'FAIL_PRODUCT') {
        return Promise.reject(new Error('Create failed'))
      }
      return Promise.resolve({ id: 'p1', ...prod, active: true, createdAt: new Date().toISOString() })
    }),
    updateProduct: vi.fn().mockImplementation((id: string) => {
      if (id === 'FAIL_ID') {
        return Promise.reject(new Error('Update failed'))
      }
      return Promise.resolve()
    }),
    deleteProduct: vi.fn().mockImplementation((id: string) => {
      if (id === 'FAIL_ID') {
        return Promise.reject(new Error('Delete failed'))
      }
      return Promise.resolve()
    }),
  },
}))

describe('Optimistic Mutation Hooks', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  describe('useSubmitVouch', () => {
    it('optimistically removes request from cache and restores on failure', async () => {
      const initialRequests: VouchRequest[] = [
        {
          id: 'req-1',
          learnerAddress: 'G_LEARNER_1',
          learnerWallet: 'G_LEARNER_1',
          score: 80,
          tier: 'Silver',
          totalLoans: 2,
          activeLoans: 1,
          totalBorrowed: 500,
          totalRepaid: 300,
          loanAmount: 200,
          purpose: 'Laptop',
          requestedAt: '2026-01-01',
          skills: ['Rust'],
        },
      ]

      queryClient.setQueryData(queryKeys.vouches.requests(), initialRequests)

      const { result } = renderHook(() => useSubmitVouch(), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({ learnerAddress: 'FAIL_ADDRESS' })
        } catch {
          // Expected rejection
        }
      })

      const cached = queryClient.getQueryData<VouchRequest[]>(queryKeys.vouches.requests())
      expect(cached).toEqual(initialRequests)
    })
  })

  describe('useAddProduct', () => {
    it('optimistically appends product and rolls back on failure', async () => {
      const initialProducts: VendorProduct[] = [
        { id: 'p0', name: 'Existing Item', price: 50, active: true, createdAt: '2026-01-01' },
      ]

      queryClient.setQueryData(queryKeys.vendors.products(), initialProducts)

      const { result } = renderHook(() => useAddProduct(), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({ name: 'FAIL_PRODUCT', price: 100 })
        } catch {
          // Expected rejection
        }
      })

      const cached = queryClient.getQueryData<VendorProduct[]>(queryKeys.vendors.products())
      expect(cached).toEqual(initialProducts)
    })
  })

  describe('useUpdateProduct', () => {
    it('optimistically updates product and rolls back on failure', async () => {
      const initialProducts: VendorProduct[] = [
        { id: 'p1', name: 'Test Product', price: 100, active: true, createdAt: '2026-01-01' },
      ]

      queryClient.setQueryData(queryKeys.vendors.products(), initialProducts)

      const { result } = renderHook(() => useUpdateProduct(), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({ id: 'FAIL_ID', data: { name: 'Updated Name' } })
        } catch {
          // Expected rejection
        }
      })

      const cached = queryClient.getQueryData<VendorProduct[]>(queryKeys.vendors.products())
      expect(cached).toEqual(initialProducts)
    })
  })
})
