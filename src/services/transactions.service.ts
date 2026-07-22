import { api } from './api'
import { idempotencyService } from './idempotency.service'
import type { SubmittedTransaction, TransactionType } from '../types'

export const transactionsService = {
  /**
   * Submits a signed XDR transaction to the Stellar network via the backend.
   *
   * Backend contract (POST /transactions/submit, SubmitTransactionRequestDto):
   * body is `{ xdr, type, idempotency_key? }` — the field is named `xdr`, not `signedXdr`.
   * Response envelope is `{ success, data: { transactionHash, status }, message }`.
   *
   * Idempotency: an idempotency key is auto-generated and sent to the API.
   * The XDR is also hashed and checked against localStorage to prevent
   * accidental duplicate submissions on the client side. Records expire
   * after 24 hours.
   */
  submit: async (
    signedXdr: string,
    type: TransactionType
  ): Promise<SubmittedTransaction> => {
    const idempotencyKey = idempotencyService.generateKey()
    const xdrHash = await idempotencyService.hashXdr(signedXdr)

    // Check for duplicate XDR hash (same transaction already submitted)
    const existingByHash = idempotencyService.findExisting(xdrHash)
    if (existingByHash) {
      return {
        transactionHash: existingByHash.transactionHash,
        status: 'pending',
      }
    }

    // Check for duplicate idempotency key (extremely unlikely but possible
    // if the same key was reused due to a retry before store() completed)
    const existingByKey = idempotencyService.findByKey(idempotencyKey)
    if (existingByKey) {
      return {
        transactionHash: existingByKey.transactionHash,
        status: 'pending',
      }
    }

    const res = await api.post('/transactions/submit', {
      xdr: signedXdr,
      type,
      idempotency_key: idempotencyKey,
    })

    const result: SubmittedTransaction = res.data.data

    // Store the record for future deduplication
    idempotencyService.store({
      idempotencyKey,
      xdrHash,
      transactionHash: result.transactionHash,
      type,
      createdAt: new Date().toISOString(),
    })

    return result
  },
}
