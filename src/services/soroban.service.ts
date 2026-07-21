import {
  rpc,
  Contract,
  TransactionBuilder,
  Account,
  Networks,
  scValToNative,
  Address,
  xdr,
} from '@stellar/stellar-sdk'
import { CONTRACT_IDS, SOROBAN_RPC_URL } from '../constants/config'
import type {
  SorobanPoolStats,
  SorobanReputationScore,
  SorobanLoanStatus,
  ContractWasmInfo,
  VerificationReconciliation,
  PoolInfo,
} from '../types'

const DUMMY_PUBLIC_KEY = 'GBOHMCRO7J4XXA435LQ56RNEBZHRJ77LK4FE2XSS6DXY6NMKYMRH6YTS'

function getRpcServer(): rpc.Server {
  return new rpc.Server(SOROBAN_RPC_URL)
}

function createDummyAccount(): Account {
  return new Account(DUMMY_PUBLIC_KEY, '0')
}

async function computeSha256(buffer: Uint8Array | ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer)

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  try {
    const nodeCrypto = await import('crypto')
    return nodeCrypto
      .createHash('sha256')
      .update(bytes)
      .digest('hex')
  } catch {
    throw new Error('No SHA-256 crypto implementation available in this environment.')
  }
}

async function simulateContractCall<T>(
  contractId: string,
  method: string,
  args: xdr.ScVal[] = []
): Promise<T> {
  const server = getRpcServer()
  const dummyAccount = createDummyAccount()
  const contract = new Contract(contractId)

  const tx = new TransactionBuilder(dummyAccount, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  const simResult = await server.simulateTransaction(tx)

  if (rpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation error: ${simResult.error}`)
  }

  const rawSim = simResult as unknown as Record<string, unknown>
  const resultObj = rawSim.result as Record<string, unknown> | undefined
  if (resultObj && resultObj.retval) {
    return scValToNative(resultObj.retval as xdr.ScVal) as T
  }

  const resultsArr = rawSim.results as Array<Record<string, unknown>> | undefined
  if (Array.isArray(resultsArr) && resultsArr[0] && resultsArr[0].retval) {
    return scValToNative(resultsArr[0].retval as xdr.ScVal) as T
  }

  throw new Error('No return value found in Soroban simulation result.')
}

export const sorobanService = {
  getContractWasmHash: async (contractId: string): Promise<string> => {
    const server = getRpcServer()
    const buffer = await server.getContractWasmByContractId(contractId)
    return computeSha256(buffer)
  },

  getAllContractWasmHashes: async (): Promise<Record<string, ContractWasmInfo>> => {
    const contractList = [
      { key: 'creditline', name: 'Creditline', id: CONTRACT_IDS.creditline },
      { key: 'reputation', name: 'Reputation', id: CONTRACT_IDS.reputation },
      { key: 'liquidityPool', name: 'Liquidity Pool', id: CONTRACT_IDS.liquidityPool },
      { key: 'vendorRegistry', name: 'Vendor Registry', id: CONTRACT_IDS.vendorRegistry },
      { key: 'parameters', name: 'Parameters', id: CONTRACT_IDS.parameters },
    ]

    const results: Record<string, ContractWasmInfo> = {}

    await Promise.all(
      contractList.map(async (item) => {
        try {
          const hash = await sorobanService.getContractWasmHash(item.id)
          results[item.key] = {
            key: item.key,
            name: item.name,
            contractId: item.id,
            wasmHash: hash,
            status: 'success',
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to fetch WASM hash'
          results[item.key] = {
            key: item.key,
            name: item.name,
            contractId: item.id,
            wasmHash: null,
            status: 'error',
            error: message,
          }
        }
      })
    )

    return results
  },

  getPoolStats: async (): Promise<SorobanPoolStats> => {
    const raw = await simulateContractCall<{
      total_liquidity?: string | number | bigint
      available_liquidity?: string | number | bigint
      locked_liquidity?: string | number | bigint
      total_shares?: string | number | bigint
      share_price?: string | number | bigint
    }>(CONTRACT_IDS.liquidityPool, 'get_pool_stats')

    const parseNum = (val: string | number | bigint | undefined): number => {
      if (val === undefined || val === null) return 0
      return Number(val)
    }

    const rawSharePrice = parseNum(raw.share_price)
    const sharePrice = rawSharePrice > 0 ? (rawSharePrice > 100 ? rawSharePrice / 10000 : rawSharePrice) : 1.0

    return {
      totalLiquidity: parseNum(raw.total_liquidity),
      availableLiquidity: parseNum(raw.available_liquidity),
      lockedLiquidity: parseNum(raw.locked_liquidity),
      totalShares: parseNum(raw.total_shares),
      sharePrice,
    }
  },

  getReputationScore: async (address: string): Promise<SorobanReputationScore> => {
    const addressVal = new Address(address).toScVal()
    const rawScore = await simulateContractCall<string | number | bigint>(
      CONTRACT_IDS.reputation,
      'get_score',
      [addressVal]
    )
    return {
      address,
      score: Number(rawScore ?? 0),
    }
  },

  getLoanStatus: async (loanId: string): Promise<SorobanLoanStatus> => {
    let loanIdVal: xdr.ScVal
    try {
      loanIdVal = xdr.ScVal.scvU64(xdr.Uint64.fromString(loanId))
    } catch {
      loanIdVal = xdr.ScVal.scvU64(xdr.Uint64.fromString('0'))
    }

    const rawLoan = await simulateContractCall<{
      borrower?: string
      amount?: string | number | bigint
      paid_installments?: string | number | bigint
      status?: string | number | { name?: string }
    }>(CONTRACT_IDS.creditline, 'get_loan', [loanIdVal])

    return {
      id: loanId,
      borrower: String(rawLoan.borrower ?? ''),
      amount: Number(rawLoan.amount ?? 0),
      paidInstallments: Number(rawLoan.paid_installments ?? 0),
      status: typeof rawLoan.status === 'string' ? rawLoan.status : 'Active',
    }
  },

  reconcilePoolStats: (
    apiStats: PoolInfo | null,
    sorobanStats: SorobanPoolStats | null
  ): VerificationReconciliation => {
    if (!apiStats || !sorobanStats) {
      return {
        totalLiquidityMatch: true,
        availableLiquidityMatch: true,
        lockedLiquidityMatch: true,
        sharePriceMatch: true,
        hasAnyMismatch: false,
        apiStats,
        sorobanStats,
      }
    }

    const totalLiquidityMatch = Math.abs(apiStats.totalLiquidity - sorobanStats.totalLiquidity) < 1
    const availableLiquidityMatch =
      Math.abs(apiStats.availableLiquidity - sorobanStats.availableLiquidity) < 1
    const lockedLiquidityMatch = Math.abs(apiStats.lockedLiquidity - sorobanStats.lockedLiquidity) < 1
    const sharePriceMatch = Math.abs(apiStats.sharePrice - sorobanStats.sharePrice) < 0.001

    const hasAnyMismatch =
      !totalLiquidityMatch ||
      !availableLiquidityMatch ||
      !lockedLiquidityMatch ||
      !sharePriceMatch

    return {
      totalLiquidityMatch,
      availableLiquidityMatch,
      lockedLiquidityMatch,
      sharePriceMatch,
      hasAnyMismatch,
      apiStats,
      sorobanStats,
    }
  },
}
