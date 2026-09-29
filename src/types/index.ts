export type WalletType = 'freighter' | 'lobstr' | null

/** Matches backend UserProfileDto (GET /users/me `data` payload) */
export interface UserProfile {
  wallet: string
  name: string | null
  avatar: string | null
  role: 'sponsor' | 'vendor' | 'mentor' | null
  preferences: {
    notifications: boolean
    theme: string
    language: string
  }
  createdAt: string
}

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
  city?: string
  website?: string
  description?: string
  rating?: number
}

/** Matches backend TransactionType enum (submit-transaction-request.dto.ts) */
export type TransactionType = 'deposit' | 'withdraw' | 'loan_create' | 'loan_repay'

/** Matches backend LiquidityDepositPreviewDto */
export interface DepositPreview {
  depositAmount: number
  sharesReceived: number
  currentSharePrice: number
  newTotalValue: number
  currentTotalLiquidity: number
}

/** Matches backend LiquidityWithdrawPreviewDto */
export interface WithdrawPreview {
  shares: number
  ownedShares: number
  remainingShares: number
  currentSharePrice: number
  expectedAmount: number
  feeBps: number
  fee: number
  netAmount: number
  availableLiquidity: number
}

/** Matches backend LiquidityDeposit/WithdrawResponseDto (the `data` field of the envelope) */
export interface UnsignedTransaction<TPreview> {
  unsignedXdr: string
  description: string
  preview: TPreview
}

/** Matches backend SubmitTransactionResponseDto (the `data` field of the envelope) */
export interface SubmittedTransaction {
  transactionHash: string
  status: 'pending'
}

export interface PoolInfo {
  totalDeposits: number
  totalLiquidity: number
  lockedLiquidity: number
  availableLiquidity: number
  totalShares: number
  sharePrice: number
  apy: number
  utilization: number
  totalInvestors: number
  activeLoans: number
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

export interface SorobanPoolStats {
  totalLiquidity: number
  availableLiquidity: number
  lockedLiquidity: number
  totalShares: number
  sharePrice: number
}

export interface SorobanReputationScore {
  address: string
  score: number
}

export interface SorobanLoanStatus {
  id: string
  borrower: string
  amount: number
  paidInstallments: number
  status: string
}

export interface ContractWasmInfo {
  key: string
  name: string
  contractId: string
  wasmHash: string | null
  status: 'loading' | 'success' | 'error'
  error?: string
}

export interface MySummary {
  shares: number
  value: number
  sharePrice: number
}

export interface VerificationReconciliation {
  totalLiquidityMatch: boolean
  availableLiquidityMatch: boolean
  lockedLiquidityMatch: boolean
  sharePriceMatch: boolean
  hasAnyMismatch: boolean
  apiStats: PoolInfo | null
  sorobanStats: SorobanPoolStats | null
}

