import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { sponsorsService } from '../services/sponsors.service'
import { transactionsService } from '../services/transactions.service'
import { queryKeys, invalidateSubtree } from '../services/queryKeys'
import { useTransaction } from '../hooks/useTransaction'
import { useWallet } from '../hooks/useWallet'
import { useToast } from '../hooks/useToast'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import type { MySummary, PoolInfo } from '../types'
import { colors } from '../constants/colors'
import {
  TrendingUp,
  Wallet,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

type Tab = 'deposit' | 'withdraw'

export function Sponsors() {
  const { isConnected } = useWallet()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('deposit')
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawShares, setWithdrawShares] = useState('')
  const [successData, setSuccessData] = useState<{
    hash: string
    amount: number
    profit: number
  } | null>(null)

  const queryClient = useQueryClient()
  const { data: poolInfo, isLoading: poolLoading } = useQuery<PoolInfo>({
    queryKey: queryKeys.pool.info(),
    queryFn: sponsorsService.getPoolInfo,
    enabled: isConnected,
  })

  const {
    data: mySummary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useQuery<MySummary>({
    queryKey: queryKeys.pool.mySummary(),
    queryFn: sponsorsService.getMySummary,
    enabled: isConnected,
  })

  const { execute, isLoading: txLoading, error: txError } = useTransaction()

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(depositAmount)
    if (!amount || amount <= 0) return

    try {
      const result = await execute(
        () => sponsorsService.deposit(amount),
        async (signedXdr, transaction) => {
          const submitted = await transactionsService.submit(signedXdr, 'deposit')
          return {
            hash: submitted.transactionHash,
            amount: transaction.preview.depositAmount,
            profit: 0,
          }
        },
      )
      setSuccessData(result)
      setDepositAmount('')
      invalidateSubtree.pool(queryClient)
      toast.success('Deposit submitted successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Deposit failed.'
      toast.error(message)
    }
  }

  const sharesNum = Number(withdrawShares)
  const estimatedPayout = sharesNum * (poolInfo?.sharePrice || 0)
  const overBalance = mySummary ? sharesNum > mySummary.shares : false
  const overLiquidity = poolInfo ? estimatedPayout > poolInfo.availableLiquidity : false
  const hasShares = mySummary ? mySummary.shares > 0 : false
  const hasValidationError = overBalance || overLiquidity
  const positionQueryLoading = summaryLoading

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    const shares = Number(withdrawShares)
    if (!shares || shares <= 0 || hasValidationError) return

    try {
      const result = await execute(
        () => sponsorsService.withdraw(shares),
        async (signedXdr, transaction) => {
          const submitted = await transactionsService.submit(signedXdr, 'withdraw')
          return {
            hash: submitted.transactionHash,
            amount: transaction.preview.netAmount,
            // The backend does not report realized profit on withdrawal;
            // the success card hides the profit row when it is 0.
            profit: 0,
          }
        },
      )
      setSuccessData(result)
      setWithdrawShares('')
      invalidateSubtree.pool(queryClient)
      toast.success('Withdrawal submitted successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Withdrawal failed.'
      toast.error(message)
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof ArrowUpRight }[] = [
    { key: 'deposit', label: 'Deposit', icon: ArrowDownLeft },
    { key: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
  ]

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display font-semibold text-2xl text-text-primary mb-4">
          Connect your wallet to sponsor
        </h1>
        <p className="text-text-secondary mb-8">
          You need a Stellar wallet to manage your liquidity pool shares.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl text-text-primary mb-2">
          Sponsor Dashboard
        </h1>
        <p className="text-text-muted">
          Manage your deposits and earn yield from learner loans.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand/10 rounded-xl">
                  <TrendingUp className="text-brand" size={24} />
                </div>
                <Badge label={`${poolInfo?.apy ?? 0}% APY`} variant="green" />
              </div>
              <p className="text-text-secondary text-sm mb-1">Total Deposits</p>
              <h3 className="text-2xl font-bold text-text-primary">
                {poolLoading ? <Spinner size={20} /> : `${poolInfo!.totalDeposits.toLocaleString()} USDC`}
              </h3>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Wallet style={{ color: colors.blueLight }} size={24} />
                </div>
                <Badge label={`${poolInfo?.activeLoans ?? 0} loans`} variant="blue" />
              </div>
              <p className="text-text-secondary text-sm mb-1">Available Liquidity</p>
              <h3 className="text-2xl font-bold text-text-primary">
                {poolLoading ? <Spinner size={20} /> : `${poolInfo!.availableLiquidity.toLocaleString()} USDC`}
              </h3>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Lock style={{ color: colors.amberDark }} size={24} />
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-1">Locked Liquidity</p>
              <h3 className="text-2xl font-bold text-text-primary">
                {poolLoading ? <Spinner size={20} /> : `${poolInfo!.lockedLiquidity.toLocaleString()} USDC`}
              </h3>
              <p className="text-text-muted text-xs mt-1">Backing active loans</p>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Unlock style={{ color: colors.violet }} size={24} />
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-1">Pool Utilization</p>
              <h3 className="text-2xl font-bold text-text-primary">
                {poolLoading ? <Spinner size={20} /> : `${poolInfo!.utilization.toFixed(1)}%`}
              </h3>
              <p className="text-text-muted text-xs mt-1">
                {poolInfo ? (
                  <>
                    {poolInfo.lockedLiquidity.toLocaleString()} / {poolInfo.totalLiquidity.toLocaleString()} USDC
                  </>
                ) : '—'}
              </p>
            </Card>
          </div>

          {poolInfo && (
            <Card>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display font-semibold text-text-primary">Liquidity Breakdown</h3>
                <span className="text-xs text-text-muted">
                  Share Price: {poolInfo.sharePrice.toFixed(4)} USDC &middot; {poolInfo.totalShares.toLocaleString()} shares
                </span>
              </div>
              <div className="w-full h-4 bg-surface rounded-full overflow-hidden flex" role="progressbar"
                aria-valuenow={poolInfo.utilization} aria-valuemin={0} aria-valuemax={100}
                aria-label={`Pool utilization: ${poolInfo.utilization.toFixed(1)}%`}
              >
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${Math.min(poolInfo.utilization, 100)}%` }}
                  title={`Locked: ${poolInfo.lockedLiquidity.toLocaleString()} USDC`}
                />
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.max(100 - poolInfo.utilization, 0)}%` }}
                  title={`Available: ${poolInfo.availableLiquidity.toLocaleString()} USDC`}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Locked ({poolInfo.lockedLiquidity.toLocaleString()} USDC)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  Available ({poolInfo.availableLiquidity.toLocaleString()} USDC)
                </span>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-brand/20">
            <div className="flex gap-1 p-1 rounded-xl bg-surface border border-border mb-6 w-fit"
              role="tablist" aria-label="Deposit or withdraw"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSuccessData(null) }}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeTab === tab.key
                      ? 'bg-elevated text-text-primary shadow-sm'
                      : 'text-text-muted hover:text-text-secondary'
                    }
                  `}
                >
                  <tab.icon size={16} aria-hidden="true" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'deposit' ? (
              <form onSubmit={handleDeposit} className="space-y-4" aria-label="Deposit funds form">
                <h3 className="font-display font-bold text-xl text-text-primary mb-4 flex items-center gap-2">
                  Deposit Funds
                </h3>
                <div>
                  <label htmlFor="deposit-amount" className="block text-sm text-text-secondary mb-2">
                    Amount (USDC)
                  </label>
                  <div className="relative">
                    <input
                      id="deposit-amount"
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3
                        text-text-primary focus:outline-none focus:border-brand transition-colors"
                      aria-describedby="deposit-hint"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm" aria-hidden="true">
                      USDC
                    </div>
                  </div>
                  <p id="deposit-hint" className="text-text-muted text-xs mt-1">Enter the amount of USDC to deposit.</p>
                </div>

                {txError && (
                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex gap-3">
                    <AlertCircle className="text-red-500 shrink-0" size={20} />
                    <p className="text-sm text-red-500">{txError}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  loading={txLoading}
                  disabled={!depositAmount || Number(depositAmount) <= 0}
                >
                  Deposit USDC
                  <ArrowDownLeft size={18} />
                </Button>
              </form>
            ) : summaryError ? (
              <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-sm text-red-500">Failed to load your position. Please try again later.</p>
              </div>
            ) : mySummary && !hasShares ? (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-xl text-text-primary mb-4 flex items-center gap-2">
                  Withdraw Funds
                </h3>
                <div className="p-4 bg-brand/5 rounded-xl border border-brand/10 text-center">
                  <p className="text-text-secondary text-sm">You have no shares to withdraw.</p>
                  <p className="text-text-muted text-xs mt-1">
                    Deposit USDC to receive pool shares and start earning yield.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4" aria-label="Withdraw funds form">
                <h3 className="font-display font-bold text-xl text-text-primary mb-4 flex items-center gap-2">
                  Withdraw Funds
                </h3>
                <div>
                  <label htmlFor="shares-amount" className="block text-sm text-text-secondary mb-2">
                    Amount of Shares
                  </label>
                  <p className="text-xs text-text-muted mb-2">
                    Your balance: {mySummary?.shares.toLocaleString() ?? '—'} shares
                  </p>
                  <div className="relative">
                    <input
                      id="shares-amount"
                      type="number"
                      value={withdrawShares}
                      onChange={(e) => setWithdrawShares(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 pr-20
                        text-text-primary focus:outline-none focus:border-brand transition-colors"
                      aria-describedby="shares-hint"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 items-center">
                      <button
                        type="button"
                        onClick={() => setWithdrawShares(String(mySummary?.shares ?? 0))}
                        className="text-xs font-semibold text-brand hover:text-brand/80 transition-colors px-2 py-1"
                      >
                        Max
                      </button>
                      <span className="text-text-muted text-sm" aria-hidden="true">SHARES</span>
                    </div>
                  </div>
                  <p id="shares-hint" className="text-text-muted text-xs mt-1">
                    Enter the number of pool shares to withdraw.
                  </p>
                  {overBalance && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                      <AlertCircle size={12} />
                      You only have {mySummary!.shares.toLocaleString()} shares.
                    </p>
                  )}
                  {overLiquidity && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                      <AlertCircle size={12} />
                      Withdrawal exceeds available liquidity ({poolInfo!.availableLiquidity.toLocaleString()} USDC).
                    </p>
                  )}
                </div>

                {sharesNum > 0 && !hasValidationError && (
                  <div className="p-4 bg-brand/5 rounded-xl border border-brand/10">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">Preview Value:</span>
                      <span className="text-brand font-bold">{estimatedPayout.toFixed(2)} USDC</span>
                    </div>
                    <p className="text-[10px] text-text-muted leading-tight">
                      Estimated amount based on current share price. Final amount may vary slightly.
                    </p>
                  </div>
                )}

                {txError && (
                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex gap-3">
                    <AlertCircle className="text-red-500 shrink-0" size={20} />
                    <p className="text-sm text-red-500">{txError}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  loading={txLoading}
                  disabled={!withdrawShares || Number(withdrawShares) <= 0 || positionQueryLoading || hasValidationError}
                >
                  Withdraw USDC
                  <ArrowUpRight size={18} />
                </Button>
              </form>
            )}
          </Card>

          {successData && (
            <Card className="bg-brand/5 border-brand/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand rounded-full text-bg">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="font-bold text-text-primary">Transaction Successful</h4>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Amount:</span>
                  <span className="text-text-primary font-bold">{successData.amount} USDC</span>
                </div>
                {successData.profit > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Realized Profit:</span>
                    <span className="text-brand font-bold">+{successData.profit} USDC</span>
                  </div>
                )}
              </div>

              <a
                href={`https://stellar.expert/explorer/testnet/tx/${successData.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 text-sm
                  text-text-secondary hover:text-brand transition-colors border border-border rounded-xl"
              >
                View on Stellar.expert
                <ExternalLink size={14} />
              </a>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
