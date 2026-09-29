import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useQuery } from '@tanstack/react-query'
import { Sponsors } from '../Sponsors'
import type { MySummary, PoolInfo } from '../../types'

const mockPoolInfo: PoolInfo = {
  totalDeposits: 500000,
  totalLiquidity: 600000,
  lockedLiquidity: 100000,
  availableLiquidity: 500000,
  totalShares: 50000,
  sharePrice: 10,
  apy: 12.5,
  utilization: 16.7,
  totalInvestors: 150,
  activeLoans: 25,
}

const mockMySummary: MySummary = {
  shares: 1000,
  value: 10000,
  sharePrice: 10,
}

const mockZeroSummary: MySummary = {
  shares: 0,
  value: 0,
  sharePrice: 10,
}

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual as object,
    useQuery: vi.fn(),
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
  }
})

vi.mock('../../hooks/useWallet', () => ({
  useWallet: vi.fn(),
}))

vi.mock('../../hooks/useToast', () => ({
  useToast: vi.fn(),
}))

vi.mock('../../hooks/useTransaction', () => ({
  useTransaction: vi.fn(),
}))

vi.mock('../../services/sponsors.service', () => ({
  sponsorsService: {
    getPoolInfo: vi.fn(),
    getMySummary: vi.fn(),
    deposit: vi.fn(),
    withdraw: vi.fn(),
  },
}))

vi.mock('../../services/transactions.service', () => ({
  transactionsService: { submit: vi.fn() },
}))

const mockUseWallet = vi.mocked((await import('../../hooks/useWallet')).useWallet)
const mockUseToast = vi.mocked((await import('../../hooks/useToast')).useToast)
const mockUseTransaction = vi.mocked((await import('../../hooks/useTransaction')).useTransaction)

function setupMocks({
  isConnected = true,
  poolInfo = mockPoolInfo,
  mySummary = mockMySummary,
  summaryLoading = false,
  summaryError = false,
}: {
  isConnected?: boolean
  poolInfo?: PoolInfo | null
  mySummary?: MySummary | null
  summaryLoading?: boolean
  summaryError?: boolean
} = {}) {
  const mockExecute = vi.fn()
  const mockToast = { success: vi.fn(), error: vi.fn() }

  mockUseWallet.mockReturnValue({
    address: 'GABCDEF123',
    walletType: 'freighter',
    isConnected,
    isAuthenticated: true,
    isConnecting: false,
    connectError: null,
    connectFreighter: vi.fn(),
    disconnectWallet: vi.fn(),
  })
  mockUseToast.mockReturnValue({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
    dismissToast: vi.fn(),
  })
  mockUseTransaction.mockReturnValue({ execute: mockExecute, isLoading: false, error: null })

  vi.mocked(useQuery).mockImplementation((options) => {
    const opts = options as { queryKey: readonly unknown[] }
    const key = opts.queryKey as readonly string[]
    if (key.includes('mySummary')) {
      if (summaryError) {
        return { data: undefined, isLoading: false, isError: true, error: new Error('Failed') } as never
      }
      return { data: mySummary, isLoading: summaryLoading, isError: false, error: null } as never
    }
    return { data: poolInfo, isLoading: false, isError: false, error: null } as never
  })

  return { mockExecute, mockToast }
}

describe('Sponsors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows connect prompt when wallet is not connected', () => {
    setupMocks({ isConnected: false })
    render(<Sponsors />)
    expect(screen.getByText('Connect your wallet to sponsor')).toBeInTheDocument()
  })

  it('renders pool info cards when connected', () => {
    setupMocks()
    render(<Sponsors />)
    expect(screen.getByText('Sponsor Dashboard')).toBeInTheDocument()
    expect(screen.getAllByText(/500,000 USDC/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/12.5% APY/)).toBeInTheDocument()
  })

  it('disables withdraw button while position is loading', () => {
    setupMocks({ summaryLoading: true, mySummary: null })
    render(<Sponsors />)
    const withdrawTab = screen.getByRole('tab', { name: 'Withdraw' })
    fireEvent.click(withdrawTab)
    const submitBtn = screen.getByRole('button', { name: /withdraw usdc/i })
    expect(submitBtn).toBeDisabled()
  })

  it('shows empty state for sponsor with zero shares', () => {
    setupMocks({ mySummary: mockZeroSummary })
    render(<Sponsors />)
    const withdrawTab = screen.getByRole('tab', { name: 'Withdraw' })
    fireEvent.click(withdrawTab)
    expect(screen.getByText('You have no shares to withdraw.')).toBeInTheDocument()
    expect(screen.getByText(/Deposit USDC to receive pool shares/)).toBeInTheDocument()
  })

  it('shows over-balance error when shares exceed balance', () => {
    setupMocks()
    render(<Sponsors />)
    const withdrawTab = screen.getByRole('tab', { name: 'Withdraw' })
    fireEvent.click(withdrawTab)

    const input = screen.getByLabelText('Amount of Shares') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2000' } })

    expect(screen.getByText(/You only have 1,000 shares/)).toBeInTheDocument()
  })

  it('shows over-liquidity error when payout exceeds available liquidity', () => {
    const lowLiquidityPool = { ...mockPoolInfo, availableLiquidity: 5000 }
    setupMocks({ poolInfo: lowLiquidityPool })
    render(<Sponsors />)
    const withdrawTab = screen.getByRole('tab', { name: 'Withdraw' })
    fireEvent.click(withdrawTab)

    const input = screen.getByLabelText('Amount of Shares') as HTMLInputElement
    fireEvent.change(input, { target: { value: '1000' } })

    expect(screen.getByText(/Withdrawal exceeds available liquidity \(5,000 USDC\)/)).toBeInTheDocument()
  })

  it('allows withdrawal at exact share balance boundary', () => {
    setupMocks()
    render(<Sponsors />)
    const withdrawTab = screen.getByRole('tab', { name: 'Withdraw' })
    fireEvent.click(withdrawTab)

    const input = screen.getByLabelText('Amount of Shares') as HTMLInputElement
    fireEvent.change(input, { target: { value: '1000' } })

    expect(screen.queryByText(/You only have/)).not.toBeInTheDocument()
    expect(screen.getByText(/Preview Value/)).toBeInTheDocument()
  })

  it('suppresses preview value when amount exceeds balance', () => {
    setupMocks()
    render(<Sponsors />)
    const withdrawTab = screen.getByRole('tab', { name: 'Withdraw' })
    fireEvent.click(withdrawTab)

    const input = screen.getByLabelText('Amount of Shares') as HTMLInputElement
    fireEvent.change(input, { target: { value: '1500' } })

    expect(screen.queryByText(/Preview Value/)).not.toBeInTheDocument()
  })

  it('does not show preview value for zero or empty input', () => {
    setupMocks()
    render(<Sponsors />)
    const withdrawTab = screen.getByRole('tab', { name: 'Withdraw' })
    fireEvent.click(withdrawTab)

    expect(screen.queryByText(/Preview Value/)).not.toBeInTheDocument()
  })

  it('Max button fills input with sponsor full share balance', () => {
    setupMocks()
    render(<Sponsors />)
    const withdrawTab = screen.getByRole('tab', { name: 'Withdraw' })
    fireEvent.click(withdrawTab)

    const maxButton = screen.getByText('Max')
    fireEvent.click(maxButton)

    const input = screen.getByLabelText('Amount of Shares') as HTMLInputElement
    expect(input.value).toBe('1000')
  })

  it('disabled submit button when validation error exists', () => {
    setupMocks()
    render(<Sponsors />)
    const withdrawTab = screen.getByRole('tab', { name: 'Withdraw' })
    fireEvent.click(withdrawTab)

    const input = screen.getByLabelText('Amount of Shares') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2000' } })

    const submitBtn = screen.getByRole('button', { name: /withdraw usdc/i })
    expect(submitBtn).toBeDisabled()
  })

  it('shows error state when summary query fails', () => {
    setupMocks({ summaryError: true })
    render(<Sponsors />)
    const withdrawTab = screen.getByRole('tab', { name: 'Withdraw' })
    fireEvent.click(withdrawTab)

    expect(screen.getByText('Failed to load your position. Please try again later.')).toBeInTheDocument()
  })

  it('shows sponsor balance in withdraw form', () => {
    setupMocks()
    render(<Sponsors />)
    const withdrawTab = screen.getByRole('tab', { name: 'Withdraw' })
    fireEvent.click(withdrawTab)

    expect(screen.getByText(/Your balance: 1,000 shares/)).toBeInTheDocument()
  })
})
