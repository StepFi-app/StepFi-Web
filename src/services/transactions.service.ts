import { api } from './api'
import type { SubmittedTransaction, TransactionStatusResponse, TransactionType } from '../types'

export const transactionsService = {
  /**
   * Submits a signed XDR transaction to the Stellar network via the backend.
   *
   * Backend contract (POST /transactions/submit, SubmitTransactionRequestDto):
   * body is `{ xdr, type }` — the field is named `xdr`, not `signedXdr`.
   * Response envelope is `{ success, data: { transactionHash, status }, message }`.
   */
  submit: async (
    signedXdr: string,
    type: TransactionType
  ): Promise<SubmittedTransaction> => {
    const res = await api.post('/transactions/submit', {
      xdr: signedXdr,
      type,
    })
    return res.data.data
  },

  getStatus: async (transactionHash: string): Promise<TransactionStatusResponse> => {
    const res = await api.get(`/transactions/${encodeURIComponent(transactionHash)}/status`)
    return res.data.data
  },
}
