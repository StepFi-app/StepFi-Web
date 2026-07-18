import { STELLAR_NETWORK } from '../constants/config'
import { useWalletStore, type WalletAdapter } from '../stores/wallet.store'
import type { TransactionStatusResponse, TransactionType, UnsignedTransaction } from '../types'
import { transactionsService } from './transactions.service'

export type TransactionErrorCode = 'rejected' | 'expired' | 'failed' | 'insufficient_funds' | 'timeout'
export type TransactionResult<TPreview> =
  | { ok: true; transactionHash: string; preview: TPreview }
  | { ok: false; code: TransactionErrorCode; message: string; transactionHash?: string }
export type TransactionPhase = 'pending' | 'signing' | 'submitted' | 'confirmed'

interface TransactionRequest<TPreview> {
  build: () => Promise<UnsignedTransaction<TPreview>>
  type: TransactionType
  onPhase?: (phase: TransactionPhase) => void
}
interface TransactionDependencies {
  getAdapter: () => WalletAdapter
  submit: (signedXdr: string, type: TransactionType) => Promise<{ transactionHash: string }>
  getStatus: (hash: string) => Promise<TransactionStatusResponse>
  wait: (milliseconds: number) => Promise<void>
  now: () => number
}
interface TransactionOptions { pollIntervalMs?: number; timeoutMs?: number }

const NETWORK_PASSPHRASE = (STELLAR_NETWORK as string) === 'PUBLIC'
  ? 'Public Global Stellar Network ; October 2015'
  : 'Test SDF Network ; September 2015'

function classifyError(error: unknown): TransactionResult<never> {
  const message = error instanceof Error ? error.message : 'Transaction failed.'
  const normalized = message.toLowerCase()
  if (normalized.includes('reject') || normalized.includes('declin') || normalized.includes('cancel')) return { ok: false, code: 'rejected', message }
  if (normalized.includes('insufficient') || normalized.includes('underfunded')) return { ok: false, code: 'insufficient_funds', message }
  if (normalized.includes('expired') || normalized.includes('too late')) return { ok: false, code: 'expired', message }
  return { ok: false, code: 'failed', message }
}

export class TransactionService {
  private readonly dependencies: TransactionDependencies
  private readonly options: TransactionOptions

  constructor(dependencies: TransactionDependencies, options: TransactionOptions = {}) {
    this.dependencies = dependencies
    this.options = options
  }

  async execute<TPreview>(request: TransactionRequest<TPreview>): Promise<TransactionResult<TPreview>> {
    try {
      request.onPhase?.('pending')
      const transaction = await request.build()
      if (!transaction.unsignedXdr) throw new Error('Server did not return a transaction to sign.')
      request.onPhase?.('signing')
      const signedXdr = await this.dependencies.getAdapter().sign(transaction.unsignedXdr, NETWORK_PASSPHRASE)
      const submitted = await this.dependencies.submit(signedXdr, request.type)
      request.onPhase?.('submitted')
      const deadline = this.dependencies.now() + (this.options.timeoutMs ?? 60_000)
      while (this.dependencies.now() < deadline) {
        const status = await this.dependencies.getStatus(submitted.transactionHash)
        if (status.status === 'confirmed') {
          request.onPhase?.('confirmed')
          return { ok: true, transactionHash: submitted.transactionHash, preview: transaction.preview }
        }
        if (status.status === 'failed' || status.status === 'expired') {
          return { ok: false, code: status.status, message: status.error ?? `Transaction ${status.status}.`, transactionHash: submitted.transactionHash }
        }
        await this.dependencies.wait(this.options.pollIntervalMs ?? 2_000)
      }
      return { ok: false, code: 'timeout', message: 'Transaction confirmation timed out.', transactionHash: submitted.transactionHash }
    } catch (error) {
      return classifyError(error)
    }
  }
}

export const transactionService = new TransactionService({
  getAdapter: () => useWalletStore.getState().getAdapter(),
  submit: transactionsService.submit,
  getStatus: transactionsService.getStatus,
  wait: (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds)),
  now: Date.now,
})
