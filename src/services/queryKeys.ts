import type { QueryClient } from '@tanstack/react-query'

/**
 * Canonical Query Key Factory
 *
 * All React Query keys across StepFi-Web must be declared here using hierarchical arrays.
 * This guarantees key consistency across services, pages, and components, and ensures
 * that mutation invalidations accurately target affected query subtrees.
 *
 * Guidelines for adding new query keys:
 * 1. Always use an object namespace for each entity (e.g. `pool`, `loans`, `vouches`, `vendors`, `reputation`).
 * 2. Define an `all` tuple as the root key: e.g. `all: ['entity'] as const`.
 * 3. Scope sub-keys under `all`: e.g. `detail: (id: string) => [...queryKeys.entity.all, 'detail', id] as const`.
 */
export const queryKeys = {
  pool: {
    all: ['pool'] as const,
    info: () => [...queryKeys.pool.all, 'info'] as const,
    stats: () => [...queryKeys.pool.all, 'stats'] as const,
    mySummary: () => [...queryKeys.pool.all, 'mySummary'] as const,
  },
  loans: {
    all: ['loans'] as const,
    lists: () => [...queryKeys.loans.all, 'list'] as const,
    myLoans: () => [...queryKeys.loans.lists(), 'my'] as const,
    borrower: (address: string) => [...queryKeys.loans.lists(), 'borrower', address] as const,
    detail: (id: string) => [...queryKeys.loans.all, 'detail', id] as const,
  },
  vouches: {
    all: ['vouches'] as const,
    requests: () => [...queryKeys.vouches.all, 'requests'] as const,
    myVouches: () => [...queryKeys.vouches.all, 'my'] as const,
    forLearner: (address: string) => [...queryKeys.vouches.all, 'learner', address] as const,
  },
  vendors: {
    all: ['vendors'] as const,
    lists: () => [...queryKeys.vendors.all, 'list'] as const,
    list: (params?: { page?: number; limit?: number; search?: string; category?: string }) =>
      [...queryKeys.vendors.lists(), params ?? {}] as const,
    detail: (id: string) => [...queryKeys.vendors.all, 'detail', id] as const,
    dashboard: () => [...queryKeys.vendors.all, 'dashboard'] as const,
    vendorLoans: (params?: { page?: number; limit?: number; sortField?: string; sortOrder?: string }) =>
      [...queryKeys.vendors.all, 'vendorLoans', params ?? {}] as const,
    payments: () => [...queryKeys.vendors.all, 'payments'] as const,
    products: () => [...queryKeys.vendors.all, 'products'] as const,
    apiKeys: () => [...queryKeys.vendors.all, 'apiKeys'] as const,
  },
  reputation: {
    all: ['reputation'] as const,
    score: (address: string) => [...queryKeys.reputation.all, 'score', address] as const,
    profile: (address: string) => [...queryKeys.reputation.all, 'profile', address] as const,
    history: (address: string) => [...queryKeys.reputation.all, 'history', address] as const,
  },
} as const

/**
 * Mutation Invalidation Map Helpers
 * Helper functions to trigger precise query subtree invalidations after mutations.
 */
export const invalidateSubtree = {
  pool: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.pool.all }),

  loans: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.loans.all }),

  vouches: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.vouches.all }),

  vendors: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all }),

  vendorProducts: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.vendors.products() })
    queryClient.invalidateQueries({ queryKey: queryKeys.vendors.dashboard() })
  },

  vendorApiKeys: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.vendors.apiKeys() }),

  reputation: (queryClient: QueryClient, address?: string) => {
    if (address) {
      queryClient.invalidateQueries({ queryKey: queryKeys.reputation.profile(address) })
      queryClient.invalidateQueries({ queryKey: queryKeys.reputation.history(address) })
      queryClient.invalidateQueries({ queryKey: queryKeys.reputation.score(address) })
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.reputation.all })
    }
  },
}
