import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Award, BarChart3, CreditCard, DollarSign, CheckCircle,
  UserCheck, Shield, BookOpen
} from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { reputationService } from '../services/reputation.service'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import type { LearnerProfile, ReputationHistoryPoint, Vouch, Loan } from '../types'

const TIER_COLORS: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'muted'> = {
  Gold: 'amber',
  Silver: 'muted',
  Bronze: 'amber',
  Starter: 'green',
}

const STATUS_VARIANT: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'muted'> = {
  Active: 'green',
  Pending: 'amber',
  Repaid: 'blue',
  Defaulted: 'red',
}

function formatWallet(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function ScoreChart({ data, isLoading }: { data?: ReputationHistoryPoint[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size={24} />
      </div>
    )
  }

  if (!data?.length) {
    return <div className="text-center py-16 text-text-muted">No reputation history yet.</div>
  }

  const maxScore = Math.max(...data.map((d) => d.score), 100)
  const height = 200

  return (
    <div className="w-full" role="img" aria-label={`Reputation score chart. ${data.map(d => `${new Date(d.date).toLocaleDateString()}: ${d.score}`).join(', ')}`}>
      <svg viewBox={`0 0 ${data.length * 60} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {data.map((point, i) => {
          const barH = (point.score / maxScore) * (height - 30)
          const x = i * 60 + 8
          const y = height - 20 - barH
          return (
            <g key={point.date}>
              <rect x={x} y={y} width={44} height={barH} fill="url(#barFill)" rx={3} />
              <text
                x={x + 22} y={y - 6}
                textAnchor="middle" fill="#A8BCCF"
                fontSize="10" fontFamily="JetBrains Mono, monospace"
              >
                {point.score}
              </text>
              <text
                x={x + 22} y={height - 4}
                textAnchor="middle" fill="#5A7A94"
                fontSize="9"
              >
                {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function VouchRequestButton({ walletAddress }: { walletAddress: string }) {
  const { isConnected } = useWallet()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => reputationService.requestVouch(walletAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouches', walletAddress] })
    },
  })

  if (!isConnected) return null

  return (
    <Button
      onClick={() => mutation.mutate()}
      loading={mutation.isPending}
      disabled={mutation.isSuccess}
      variant={mutation.isSuccess ? 'secondary' : 'primary'}
      size="sm"
    >
      {mutation.isSuccess ? (
        <><CheckCircle size={14} /> Request Sent</>
      ) : (
        <><UserCheck size={14} /> Request Vouch</>
      )}
    </Button>
  )
}

export function LearnerProfile() {
  const { walletAddress } = useParams<{ walletAddress: string }>()

  const profileQuery = useQuery<LearnerProfile>({
    queryKey: ['learner-profile', walletAddress],
    queryFn: () => reputationService.getProfile(walletAddress!),
    enabled: !!walletAddress,
  })

  const historyQuery = useQuery<ReputationHistoryPoint[]>({
    queryKey: ['reputation-history', walletAddress],
    queryFn: () => reputationService.getHistory(walletAddress!),
    enabled: !!walletAddress,
  })

  const loansQuery = useQuery<Loan[]>({
    queryKey: ['learner-loans', walletAddress],
    queryFn: () => reputationService.getLearnerLoans(walletAddress!),
    enabled: !!walletAddress,
  })

  const vouchesQuery = useQuery<Vouch[]>({
    queryKey: ['vouches', walletAddress],
    queryFn: () => reputationService.getVouches(walletAddress!),
    enabled: !!walletAddress,
  })

  if (!walletAddress) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display font-bold text-3xl text-text-primary mb-4">Invalid URL</h2>
        <p className="text-text-secondary">No wallet address provided.</p>
      </div>
    )
  }

  if (profileQuery.isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (profileQuery.isError) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display font-bold text-3xl text-text-primary mb-4">Profile not found</h2>
        <p className="text-text-secondary">Could not load profile for this wallet address.</p>
      </div>
    )
  }

  const profile = profileQuery.data!

  const stats = [
    { label: 'Total Loans', value: profile.totalLoans, icon: BarChart3, color: '#22C55E' },
    { label: 'Active Loans', value: profile.activeLoans, icon: CreditCard, color: '#2563EB' },
    { label: 'Total Borrowed', value: `$${profile.totalBorrowed.toLocaleString()}`, icon: DollarSign, color: '#F59E0B' },
    { label: 'Total Repaid', value: `$${profile.totalRepaid.toLocaleString()}`, icon: CheckCircle, color: '#22C55E' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-brand/10 border border-brand/20">
              <Shield size={24} className="text-brand" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-text-primary">
                {formatWallet(profile.walletAddress)}
              </h1>
              <p className="text-text-muted text-sm font-mono">{profile.walletAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-elevated border border-border">
              <Award size={16} className="text-brand" />
              <span className="text-text-primary font-display font-bold text-lg">{profile.score}</span>
              <span className="text-text-muted text-xs">score</span>
            </div>
            <Badge label={profile.tier} variant={TIER_COLORS[profile.tier] ?? 'muted'} />
            {profile.skills.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                {profile.skills.map((skill) => (
                  <Badge key={skill} label={skill} variant="blue" />
                ))}
              </div>
            )}
          </div>
          {profile.skills.length > 0 && (
            <div className="flex sm:hidden items-center gap-1.5 mt-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} label={skill} variant="blue" />
              ))}
            </div>
          )}
        </div>
        <VouchRequestButton walletAddress={walletAddress} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: `${stat.color}15` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-text-muted text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-text-primary font-display font-bold text-xl">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-text-secondary" />
            <h3 className="font-display font-bold text-lg text-text-primary">Reputation History</h3>
          </div>
          <ScoreChart data={historyQuery.data} isLoading={historyQuery.isLoading} />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <UserCheck size={18} className="text-text-secondary" />
            <h3 className="font-display font-bold text-lg text-text-primary">Active Vouches</h3>
          </div>
          {vouchesQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size={24} />
            </div>
          ) : !vouchesQuery.data?.length ? (
            <div className="text-center py-12 text-text-muted">No vouches received yet.</div>
          ) : (
            <div className="space-y-3">
              {vouchesQuery.data
                .filter((v) => v.status === 'Active')
                .map((vouch) => (
                  <div
                    key={vouch.id}
                    className="p-4 rounded-xl border border-border bg-elevated/30"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Award size={14} className="text-amber-400" />
                        <span className="text-text-primary text-sm font-medium font-mono">
                          {formatWallet(vouch.mentor)}
                        </span>
                      </div>
                      <Badge label="Active" variant="green" />
                    </div>
                    {vouch.message && (
                      <p className="text-text-muted text-xs mt-1">{vouch.message}</p>
                    )}
                    <p className="text-text-muted text-xs mt-1">
                      {new Date(vouch.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-text-secondary" />
          <h3 className="font-display font-bold text-lg text-text-primary">Loan History</h3>
        </div>
        {loansQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size={24} />
          </div>
        ) : !loansQuery.data?.length ? (
          <div className="text-center py-12 text-text-muted">No loans yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Loan history</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="text-left py-3 px-3 text-text-muted font-medium">ID</th>
                  <th scope="col" className="text-left py-3 px-3 text-text-muted font-medium">Amount</th>
                  <th scope="col" className="text-left py-3 px-3 text-text-muted font-medium">Status</th>
                  <th scope="col" className="text-left py-3 px-3 text-text-muted font-medium">Progress</th>
                  <th scope="col" className="text-left py-3 px-3 text-text-muted font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {loansQuery.data.map((loan) => (
                  <tr key={loan.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-3 text-text-muted font-mono text-xs">{loan.id.slice(0, 8)}...</td>
                    <td className="py-3 px-3 text-text-primary font-mono">${loan.amount.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <Badge label={loan.status} variant={STATUS_VARIANT[loan.status] ?? 'muted'} />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-elevated max-w-24">
                          <div
                            className="h-full rounded-full bg-brand transition-all"
                            style={{
                              width: `${loan.installments > 0 ? (loan.paidInstallments / loan.installments) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-text-muted text-xs font-mono">
                          {loan.paidInstallments}/{loan.installments}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-text-muted text-xs">
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
