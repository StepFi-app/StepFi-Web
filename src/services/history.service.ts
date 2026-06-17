import { api } from './api'

export type TransactionStatus = 'pending' | 'confirmed' | 'failed'
export type TransactionType =
  | 'payment'
  | 'payment_request'
  | 'loan_disbursement'
  | 'repayment'
  | 'other'

export interface Transaction {
  id: string
  hash: string
  type: TransactionType
  amount: number
  asset?: string
  from: string
  to: string
  status: TransactionStatus
  createdAt: string
  network: 'public' | 'testnet'
  meta?: Record<string, unknown>
}

export interface TransactionFilter {
  type?: TransactionType | ''
  status?: TransactionStatus | ''
  fromDate?: string
  toDate?: string
}

export async function fetchTransactions(
  walletAddress: string,
  filters?: TransactionFilter
): Promise<Transaction[]> {
  const params: Record<string, string> = {}
  if (filters?.type) params.type = filters.type
  if (filters?.status) params.status = filters.status
  if (filters?.fromDate) params.from = filters.fromDate
  if (filters?.toDate) params.to = filters.toDate

  const res = await api.get<Transaction[]>(
    `/wallets/${encodeURIComponent(walletAddress)}/transactions`,
    { params }
  )
  return res.data
}

export function stellarExpertUrl(tx: Transaction) {
  const base = tx.network === 'testnet'
    ? 'https://stellar.expert/explorer/testnet/tx'
    : 'https://stellar.expert/explorer/public/tx'
  return `${base}/${tx.hash}`
}
