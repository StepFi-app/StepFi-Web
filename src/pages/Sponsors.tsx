import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { sponsorsService } from '../services/sponsors.service'
import { useTransaction } from '../hooks/useTransaction'
import { useWallet } from '../hooks/useWallet'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react'

export function Sponsors() {
  const { isConnected } = useWallet()
  const [shares, setShares] = useState('')
  const [successData, setSuccessData] = useState<{
    hash: string
    amount: number
    profit: number
  } | null>(null)

  const { data: poolInfo, isLoading: poolLoading } = useQuery({
    queryKey: ['poolInfo'],
    queryFn: sponsorsService.getPoolInfo,
    enabled: isConnected
  })

  const { execute, isLoading: txLoading, error: txError } = useTransaction()

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shares || isNaN(Number(shares))) return

    try {
      const result = await execute(
        () => sponsorsService.withdraw(Number(shares)),
        (signedXdr) => sponsorsService.submitTransaction(signedXdr)
      )
      setSuccessData(result)
      setShares('')
    } catch {
      // Error handled by useTransaction and shown in UI
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display font-bold text-3xl text-text-primary mb-4">
          Connect your wallet to sponsor
        </h2>
        <p className="text-text-secondary mb-8">
          You need a Stellar wallet to manage your liquidity pool shares.
        </p>
      </div>
    )
  }

  const previewUsdc = Number(shares) * (poolInfo?.sharePrice || 0)

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display font-bold text-3xl text-text-primary mb-2">
          Sponsor Dashboard
        </h1>
        <p className="text-text-muted">
          Manage your deposits and earn yield from learner loans.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand/10 rounded-xl">
                  <TrendingUp className="text-brand" size={24} />
                </div>
                <Badge label={`+${poolInfo?.apy || 0}% APY`} variant="green" />
              </div>
              <p className="text-text-secondary text-sm mb-1">Total Deposits</p>
              <h3 className="text-2xl font-bold text-text-primary">
                {poolLoading ? <Spinner size={20} /> : `${poolInfo?.totalDeposits.toLocaleString()} USDC`}
              </h3>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Wallet style={{ color: '#3B82F6' }} size={24} />
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-1">Available Liquidity</p>
              <h3 className="text-2xl font-bold text-text-primary">
                {poolLoading ? <Spinner size={20} /> : `${poolInfo?.availableLiquidity.toLocaleString()} USDC`}
              </h3>
            </Card>
          </div>

          <Card>
            <h3 className="font-display font-bold text-xl text-text-primary mb-6">
              Liquidity Pool Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Total Shares</p>
                <p className="font-mono text-text-primary">
                  {poolLoading ? '...' : poolInfo?.totalShares.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Share Price</p>
                <p className="font-mono text-text-primary">
                  {poolLoading ? '...' : `${poolInfo?.sharePrice.toFixed(4)} USDC`}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Locked Capital</p>
                <p className="font-mono text-text-primary">
                  {poolLoading ? '...' : `${poolInfo?.lockedLiquidity.toLocaleString()} USDC`}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Status</p>
                <p className="text-brand font-medium">Active</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-brand/20">
            <h3 className="font-display font-bold text-xl text-text-primary mb-4 flex items-center gap-2">
              Withdraw Funds
            </h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Amount of Shares
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3
                      text-text-primary focus:outline-none focus:border-brand transition-colors"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                    SHARES
                  </div>
                </div>
              </div>

              {Number(shares) > 0 && (
                <div className="p-4 bg-brand/5 rounded-xl border border-brand/10">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Preview Value:</span>
                    <span className="text-brand font-bold">{previewUsdc.toFixed(2)} USDC</span>
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
                disabled={!shares || Number(shares) <= 0}
              >
                Withdraw USDC
                <ArrowUpRight size={18} />
              </Button>
            </form>
          </Card>

          {successData && (
            <Card className="bg-brand/5 border-brand/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand rounded-full text-bg">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="font-bold text-text-primary">Withdrawal Successful</h4>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Amount Received:</span>
                  <span className="text-text-primary font-bold">{successData.amount} USDC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Realized Profit:</span>
                  <span className="text-brand font-bold">+{successData.profit} USDC</span>
                </div>
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
