export type WalletType = 'freighter' | 'lobstr' | null

export interface User {
  walletAddress: string
  walletType: WalletType
  accessToken: string
  refreshToken: string
}

export interface Loan {
  id: string
  borrower: string
  vendor: string
  amount: number
  installments: number
  paidInstallments: number
  status: 'Pending' | 'Active' | 'Repaid' | 'Defaulted'
  createdAt: string
  repayments: Repayment[]
}

export interface Repayment {
  index: number
  amount: number
  paid: boolean
  paidAt?: string
}

export interface ReputationScore {
  walletAddress: string
  score: number
  tier: 'Starter' | 'Bronze' | 'Silver' | 'Gold'
  interestRate: number
  creditLimit: number
  lastUpdated: string
}

export interface Vendor {
  id: string
  name: string
  category: string
  country: string
  website?: string
  description?: string
  rating?: number
}

export interface PoolInfo {
  totalDeposits: number
  totalShares: number
  sharePrice: number
  availableLiquidity: number
  lockedLiquidity: number
  apy: number
}

export interface VendorDashboardOverview {
  totalLoans: number
  activeLoans: number
  totalDisbursed: number
  totalRepaid: number
  totalProducts: number
}

export interface VendorLoan {
  id: string
  product: string
  borrower: string
  amount: number
  paidAmount: number
  installments: number
  paidInstallments: number
  status: 'Pending' | 'Active' | 'Repaid' | 'Defaulted'
  createdAt: string
}

export interface VendorPayment {
  id: string
  loanId: string
  borrower: string
  amount: number
  paidAt: string
}

export interface VendorProduct {
  id: string
  name: string
  description?: string
  price: number
  active: boolean
  createdAt: string
}

export interface ApiKey {
  id: string
  label: string
  prefix: string
  createdAt: string
  lastUsedAt?: string
  revoked: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface LearnerProfile {
  walletAddress: string
  score: number
  tier: 'Starter' | 'Bronze' | 'Silver' | 'Gold'
  skills: string[]
  totalLoans: number
  activeLoans: number
  totalBorrowed: number
  totalRepaid: number
  lastUpdated: string
}

export interface ReputationHistoryPoint {
  date: string
  score: number
}

export interface Vouch {
  id: string
  mentor: string
  message?: string
  status: 'Active' | 'Revoked'
  createdAt: string
}

export interface VouchRequest {
  id: string
  learnerAddress: string
  learnerWallet: string
  score: number
  tier: 'Starter' | 'Bronze' | 'Silver' | 'Gold'
  totalLoans: number
  activeLoans: number
  totalBorrowed: number
  totalRepaid: number
  loanAmount: number
  purpose: string
  requestedAt: string
  skills: string[]
}

export interface ActiveVouch {
  id: string
  learnerAddress: string
  learnerWallet: string
  score: number
  tier: 'Starter' | 'Bronze' | 'Silver' | 'Gold'
  reputationBoost: number
  interestRateBefore: number
  interestRateAfter: number
  expiryDate: string
  repaymentStatus: 'current' | 'late' | 'defaulted'
  createdAt: string
  loanAmount: number
  paidAmount: number
  installments: number
  paidInstallments: number
}

export interface VouchResponse {
  id: string
  learnerAddress: string
  mentorAddress: string
  status: 'Active' | 'Revoked'
  createdAt: string
  txHash: string
}
