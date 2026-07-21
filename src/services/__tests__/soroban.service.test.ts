import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sorobanService } from '../soroban.service'
import type { PoolInfo, SorobanPoolStats } from '../../types'

const mockGetContractWasmByContractId = vi.fn().mockImplementation((contractId: string) => {
  if (contractId === 'FAIL_CONTRACT_ID') {
    return Promise.reject(new Error('Contract not found'))
  }
  return Promise.resolve(new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]))
})

const mockSimulateTransaction = vi.fn().mockImplementation(() => {
  return Promise.resolve({
    result: {
      retval: {
        total_liquidity: 48320,
        available_liquidity: 31200,
        locked_liquidity: 17120,
        total_shares: 48320,
        share_price: 10000,
      },
    },
  })
})

vi.mock('@stellar/stellar-sdk', async () => {
  const actual = await vi.importActual<typeof import('@stellar/stellar-sdk')>('@stellar/stellar-sdk')

  function MockServer() {
    return {
      getContractWasmByContractId: mockGetContractWasmByContractId,
      simulateTransaction: mockSimulateTransaction,
    }
  }

  return {
    ...actual,
    scValToNative: (val: unknown) => val,
    rpc: {
      ...actual.rpc,
      Server: MockServer,
      Api: {
        isSimulationError: () => false,
      },
    },
  }
})

describe('sorobanService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getContractWasmHash', () => {
    it('computes sha256 hash for a valid contract wasm bytecode', async () => {
      const hash = await sorobanService.getContractWasmHash('VALID_CONTRACT_ID')
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBe(64)
    })
  })

  describe('getAllContractWasmHashes', () => {
    it('returns contract wasm info for all five configured contracts', async () => {
      const results = await sorobanService.getAllContractWasmHashes()
      expect(results).toBeDefined()
      expect(Object.keys(results)).toHaveLength(5)
      expect(results.liquidityPool).toBeDefined()
      expect(results.liquidityPool.status).toBe('success')
      expect(results.liquidityPool.wasmHash).toBeDefined()
    })
  })

  describe('getPoolStats', () => {
    it('parses live pool stats correctly from simulation response', async () => {
      const stats = await sorobanService.getPoolStats()
      expect(stats).toBeDefined()
      expect(stats.totalLiquidity).toBe(48320)
      expect(stats.availableLiquidity).toBe(31200)
      expect(stats.lockedLiquidity).toBe(17120)
      expect(stats.sharePrice).toBe(1.0)
    })
  })

  describe('reconcilePoolStats', () => {
    it('flags no mismatch when API and Soroban numbers align', () => {
      const apiStats: PoolInfo = {
        totalDeposits: 48320,
        totalLiquidity: 48320,
        lockedLiquidity: 17120,
        availableLiquidity: 31200,
        totalShares: 48320,
        sharePrice: 1.0,
        apy: 12.4,
        utilization: 35.4,
        totalInvestors: 5,
        activeLoans: 17,
      }

      const sorobanStats: SorobanPoolStats = {
        totalLiquidity: 48320,
        availableLiquidity: 31200,
        lockedLiquidity: 17120,
        totalShares: 48320,
        sharePrice: 1.0,
      }

      const result = sorobanService.reconcilePoolStats(apiStats, sorobanStats)
      expect(result.hasAnyMismatch).toBe(false)
      expect(result.totalLiquidityMatch).toBe(true)
      expect(result.availableLiquidityMatch).toBe(true)
      expect(result.lockedLiquidityMatch).toBe(true)
      expect(result.sharePriceMatch).toBe(true)
    })

    it('detects mismatch when API and Soroban numbers differ', () => {
      const apiStats: PoolInfo = {
        totalDeposits: 50000,
        totalLiquidity: 50000,
        lockedLiquidity: 20000,
        availableLiquidity: 30000,
        totalShares: 50000,
        sharePrice: 1.05,
        apy: 12.4,
        utilization: 40.0,
        totalInvestors: 5,
        activeLoans: 17,
      }

      const sorobanStats: SorobanPoolStats = {
        totalLiquidity: 48320,
        availableLiquidity: 31200,
        lockedLiquidity: 17120,
        totalShares: 48320,
        sharePrice: 1.0,
      }

      const result = sorobanService.reconcilePoolStats(apiStats, sorobanStats)
      expect(result.hasAnyMismatch).toBe(true)
      expect(result.totalLiquidityMatch).toBe(false)
      expect(result.sharePriceMatch).toBe(false)
    })

    it('handles null arguments gracefully', () => {
      const result = sorobanService.reconcilePoolStats(null, null)
      expect(result.hasAnyMismatch).toBe(false)
    })
  })
})
