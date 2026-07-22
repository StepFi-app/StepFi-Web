import { describe, it, expect, vi } from 'vitest'
import { queryKeys, invalidateSubtree } from '../queryKeys'
import type { QueryClient } from '@tanstack/react-query'

describe('queryKeys factory', () => {
  it('generates canonical query keys for pool', () => {
    expect(queryKeys.pool.all).toEqual(['pool'])
    expect(queryKeys.pool.info()).toEqual(['pool', 'info'])
    expect(queryKeys.pool.stats()).toEqual(['pool', 'stats'])
  })

  it('generates canonical query keys for loans', () => {
    expect(queryKeys.loans.all).toEqual(['loans'])
    expect(queryKeys.loans.lists()).toEqual(['loans', 'list'])
    expect(queryKeys.loans.myLoans()).toEqual(['loans', 'list', 'my'])
    expect(queryKeys.loans.borrower('G123')).toEqual(['loans', 'list', 'borrower', 'G123'])
    expect(queryKeys.loans.detail('loan-1')).toEqual(['loans', 'detail', 'loan-1'])
  })

  it('generates canonical query keys for vouches', () => {
    expect(queryKeys.vouches.all).toEqual(['vouches'])
    expect(queryKeys.vouches.requests()).toEqual(['vouches', 'requests'])
    expect(queryKeys.vouches.myVouches()).toEqual(['vouches', 'my'])
    expect(queryKeys.vouches.forLearner('G123')).toEqual(['vouches', 'learner', 'G123'])
  })

  it('generates canonical query keys for vendors', () => {
    expect(queryKeys.vendors.all).toEqual(['vendors'])
    expect(queryKeys.vendors.lists()).toEqual(['vendors', 'list'])
    expect(queryKeys.vendors.list({ page: 1, limit: 10 })).toEqual([
      'vendors',
      'list',
      { page: 1, limit: 10 },
    ])
    expect(queryKeys.vendors.detail('v1')).toEqual(['vendors', 'detail', 'v1'])
    expect(queryKeys.vendors.products()).toEqual(['vendors', 'products'])
  })

  it('generates canonical query keys for reputation', () => {
    expect(queryKeys.reputation.all).toEqual(['reputation'])
    expect(queryKeys.reputation.score('G123')).toEqual(['reputation', 'score', 'G123'])
    expect(queryKeys.reputation.profile('G123')).toEqual(['reputation', 'profile', 'G123'])
    expect(queryKeys.reputation.history('G123')).toEqual(['reputation', 'history', 'G123'])
  })
})

describe('invalidateSubtree helpers', () => {
  it('calls queryClient.invalidateQueries with the appropriate subtree keys', () => {
    const mockInvalidate = vi.fn()
    const mockQueryClient = {
      invalidateQueries: mockInvalidate,
    } as unknown as QueryClient

    invalidateSubtree.pool(mockQueryClient)
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: queryKeys.pool.all })

    invalidateSubtree.loans(mockQueryClient)
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: queryKeys.loans.all })

    invalidateSubtree.vouches(mockQueryClient)
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: queryKeys.vouches.all })

    invalidateSubtree.vendorProducts(mockQueryClient)
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: queryKeys.vendors.products() })
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: queryKeys.vendors.dashboard() })
  })
})
