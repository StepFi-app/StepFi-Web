import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, ShieldCheck, Award, AlertTriangle, RotateCw,
  Clock, DollarSign, Percent, Ban, ExternalLink, XCircle,
  UserCheck, TrendingUp, Wallet,
} from 'lucide-react'
import { signTransaction, isConnected, requestAccess } from '@stellar/freighter-api'
import { useSubmitVouch, useRevokeVouch } from '../hooks/useOptimisticVouch'
import { useMentor } from '../hooks/useMentor'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { VouchRequestCard } from '../components/vouch/VouchRequestCard'
import { VouchImpactPreview } from '../components/vouch/VouchImpactPreview'
import { useWallet } from '../hooks/useWallet'
import { useToast } from '../hooks/useToast'
import { STELLAR_NETWORK } from '../constants/config'
import type { VouchRequest } from '../types'

const REPAYMENT_VARIANTS: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'muted'> = {
  current: 'green',
  late: 'amber',
  defaulted: 'red',
}

const TIER_VARIANTS: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'muted'> = {
  Gold: 'amber',
  Silver: 'muted',
  Bronze: 'amber',
  Starter: 'green',
}

function formatWallet(addr: string) {
  if (addr.length <= 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function ConfirmRevokeDialog({
  open,
  onConfirm,
  onCancel,
  revoking,
}: {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  revoking: boolean
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="revoke-dialog-title"
    >
      <div className="w-full max-w-sm">
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <Ban size={20} className="text-red-400" aria-hidden="true" />
            </div>
            <div>
              <h3 id="revoke-dialog-title" className="font-display font-bold text-lg text-text-primary">
                Revoke Vouch
              </h3>
              <p className="text-text-muted text-sm">
                This will remove your vouch and the learner will lose the reputation bonus.
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-text-primary text-xs">
              Revoking a vouch may affect your own reputation score and future vouch capacity.
              Only revoke if the learner has defaulted or the agreement has been breached.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={onCancel} disabled={revoking}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={onConfirm}
              loading={revoking}
              className="border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              <Ban size={14} aria-hidden="true" />
              Revoke
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function ProfileSection({
  address,
  score,
  tier,
  totalVouchesGiven,
  activeVouchCount,
  atRiskCount,
  totalLoanImpact,
  isLoading,
}: {
  address: string | null
  score: number
  tier: string
  totalVouchesGiven: number
  activeVouchCount: number
  atRiskCount: number
  totalLoanImpact: number
  isLoading: boolean
}) {
  if (!address) return null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size={24} />
      </div>
    )
  }

  const statCards = [
    { label: 'Vouches Given', value: totalVouchesGiven, icon: UserCheck, color: 'text-brand' },
    { label: 'Active Vouches', value: activeVouchCount, icon: ShieldCheck, color: 'text-blue-400' },
    { label: 'At Risk', value: atRiskCount, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Total Impact', value: `$${totalLoanImpact.toLocaleString()}`, icon: DollarSign, color: 'text-brand' },
  ]

  return (
    <Card className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Award size={28} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display font-bold text-xl text-text-primary">Mentor Profile</h2>
              <Badge label={tier} variant={TIER_VARIANTS[tier] ?? 'muted'} />
            </div>
            <p className="text-text-muted font-mono text-sm">{formatWallet(address)}</p>
            <div className="flex items-center gap-2 mt-1">
              <TrendingUp size={14} className="text-brand" />
              <span className="text-text-primary font-semibold">{score}</span>
              <span className="text-text-muted text-sm">reputation score</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="p-3 rounded-xl bg-elevated/50 border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon size={14} className={stat.color} aria-hidden="true" />
              <span className="text-text-muted text-xs font-medium uppercase tracking-wider">{stat.label}</span>
            </div>
            <span className="text-text-primary font-display font-bold text-lg">{stat.value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function MentorDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isConnected: walletConnected, connectFreighter } = useWallet()

  const [activeTab, setActiveTab] = useState<'requests' | 'active'>('requests')
  const [previewRequest, setPreviewRequest] = useState<VouchRequest | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null)
  const [decliningId, setDecliningId] = useState<string | null>(null)

  const {
    address,
    score,
    tier,
    totalVouchesGiven,
    activeVouchCount,
    atRiskCount,
    totalLoanImpact,
    requests,
    activeVouches,
    isLoadingReputation,
    isLoadingRequests,
    isLoadingActiveVouches,
    isErrorRequests,
    isErrorActiveVouches,
    refetchRequests,
    refetchActiveVouches,
  } = useMentor()

  const submitMutation = useSubmitVouch()
  const revokeMutation = useRevokeVouch()

  const handleVouchConfirm = async () => {
    if (!previewRequest) return

    try {
      if (!walletConnected) {
        await connectFreighter()
      }

      const connection = await isConnected()
      if (!connection.isConnected) {
        throw new Error('Freighter not installed. Download at freighter.app')
      }

      const access = await requestAccess()
      if (access.error) {
        throw new Error(access.error.message)
      }

      const txXdr = `AAAAAgAAAABz...${Math.random().toString(36).slice(2)}`
      const result = await signTransaction(txXdr, {
        networkPassphrase:
          STELLAR_NETWORK === 'TESTNET'
            ? 'Test SDF Network ; September 2015'
            : 'Public Global Stellar Network ; September 2015',
      })

      const txHash = 'signedTxXdr' in result ? (result as { signedTxXdr: string }).signedTxXdr : ''

      submitMutation.mutate(
        {
          learnerAddress: previewRequest.learnerAddress,
          txHash,
        },
        {
          onSuccess: () => {
            setPreviewRequest(null)
            toast.success('Vouch submitted successfully.')
          },
          onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to submit vouch.'
            toast.error(message)
          },
        }
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed'
      toast.error(message)
    }
  }

  const handleDecline = async (id: string) => {
    setDecliningId(id)
    await new Promise((r) => setTimeout(r, 600))
    setDecliningId(null)
  }

  const tabs = [
    {
      key: 'requests' as const,
      label: 'Pending Requests',
      icon: ClipboardList,
      count: requests.length,
    },
    {
      key: 'active' as const,
      label: 'My Active Vouches',
      icon: ShieldCheck,
      count: activeVouches.length,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-semibold text-2xl text-text-primary mb-1">
            Mentor Portal
          </h1>
          <p className="text-text-muted">
            Manage your vouch requests, active vouches, and track your mentoring impact.
          </p>
        </div>
        {!walletConnected && (
          <Button onClick={connectFreighter}>
            <Wallet size={16} />
            Connect Wallet
          </Button>
        )}
      </div>

      <ProfileSection
        address={address}
        score={score}
        tier={tier}
        totalVouchesGiven={totalVouchesGiven}
        activeVouchCount={activeVouchCount}
        atRiskCount={atRiskCount}
        totalLoanImpact={totalLoanImpact}
        isLoading={isLoadingReputation}
      />

      <div className="flex gap-1 p-1 rounded-xl bg-surface border border-border mb-8 w-fit"
        role="tablist" aria-label="Vouch tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            id={`tab-${tab.key}`}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                activeTab === tab.key
                  ? 'bg-elevated text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }
            `}
          >
            <tab.icon size={16} aria-hidden="true" />
            {tab.label}
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.5 rounded-full bg-elevated text-xs text-text-muted font-mono">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="tabpanel-requests"
        aria-labelledby="tab-requests"
        hidden={activeTab !== 'requests'}
      >
        <>
          {isLoadingRequests ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Spinner size={28} />
              <p className="text-text-muted text-sm">Loading vouch requests...</p>
            </div>
          ) : isErrorRequests ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <h3 className="font-display font-bold text-xl text-text-primary">
                Failed to load requests
              </h3>
              <p className="text-text-muted text-sm max-w-md text-center">
                Could not fetch vouch requests. Please try again later.
              </p>
              <Button variant="outline" onClick={() => refetchRequests()}>
                <RotateCw size={14} />
                Retry
              </Button>
            </div>
          ) : !requests.length ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="p-3 rounded-xl bg-elevated border border-border">
                <ClipboardList size={24} className="text-text-muted" />
              </div>
              <h3 className="font-display font-bold text-xl text-text-primary">
                No pending requests
              </h3>
              <p className="text-text-muted text-sm max-w-md text-center">
                There are no learners requesting vouches right now. Check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <VouchRequestCard
                  key={request.id}
                  request={request}
                  onReviewProfile={() =>
                    navigate(`/learner/${request.learnerAddress}`)
                  }
                  onVouch={setPreviewRequest}
                  onDecline={handleDecline}
                  declining={decliningId === request.id}
                />
              ))}
            </div>
          )}
        </>
      </div>

      <div
        role="tabpanel"
        id="tabpanel-active"
        aria-labelledby="tab-active"
        hidden={activeTab !== 'active'}
      >
        <>
          {isLoadingActiveVouches ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Spinner size={28} />
              <p className="text-text-muted text-sm">Loading active vouches...</p>
            </div>
          ) : isErrorActiveVouches ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <h3 className="font-display font-bold text-xl text-text-primary">
                Failed to load vouches
              </h3>
              <p className="text-text-muted text-sm max-w-md text-center">
                Could not fetch your active vouches. Please try again later.
              </p>
              <Button variant="outline" onClick={() => refetchActiveVouches()}>
                <RotateCw size={14} />
                Retry
              </Button>
            </div>
          ) : !activeVouches.length ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="p-3 rounded-xl bg-elevated border border-border">
                <ShieldCheck size={24} className="text-text-muted" />
              </div>
              <h3 className="font-display font-bold text-xl text-text-primary">
                No active vouches
              </h3>
              <p className="text-text-muted text-sm max-w-md text-center">
                You haven't vouched for anyone yet. Go to the Pending Requests tab to find learners.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeVouches.map((vouch) => (
                <Card key={vouch.id}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-brand/10 border border-brand/20">
                          <ShieldCheck size={16} className="text-brand" />
                        </div>
                        <span className="text-text-primary font-mono text-sm font-medium truncate">
                          {formatWallet(vouch.learnerWallet)}
                        </span>
                        <Badge label={vouch.tier} variant={TIER_VARIANTS[vouch.tier] ?? 'muted'} />
                        <Badge
                          label={vouch.repaymentStatus === 'current' ? 'Current' : vouch.repaymentStatus === 'late' ? 'Late' : 'Defaulted'}
                          variant={REPAYMENT_VARIANTS[vouch.repaymentStatus] ?? 'muted'}
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-0.5">Rep Boost</p>
                          <div className="flex items-center gap-1">
                            <Award size={14} className="text-amber-400" />
                            <span className="text-text-primary font-mono">+{vouch.reputationBoost}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-0.5">Interest</p>
                          <div className="flex items-center gap-1">
                            <Percent size={14} className="text-brand" />
                            <span className="text-text-primary font-mono">{vouch.interestRateBefore}% → {vouch.interestRateAfter}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-0.5">Expiry</p>
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-text-muted" />
                            <span className="text-text-primary font-mono text-xs">
                              {new Date(vouch.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-0.5">Repayment</p>
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} className="text-text-muted" />
                            <span className="text-text-primary font-mono text-xs">
                              ${vouch.paidAmount.toLocaleString()} / ${vouch.loanAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {vouch.installments > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-elevated max-w-48">
                            <div
                              className="h-full rounded-full bg-brand transition-all"
                              style={{
                                width: `${(vouch.paidInstallments / vouch.installments) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-text-muted text-xs font-mono">
                            {vouch.paidInstallments}/{vouch.installments}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/learner/${vouch.learnerAddress}`)}
                      >
                        <ExternalLink size={14} />
                        Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRevokeTarget(vouch.id)}
                        className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle size={14} />
                        Revoke
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      </div>

      {previewRequest && (
        <VouchImpactPreview
          request={previewRequest}
          onConfirm={handleVouchConfirm}
          onClose={() => setPreviewRequest(null)}
          confirming={submitMutation.isPending}
        />
      )}

      <ConfirmRevokeDialog
        open={!!revokeTarget}
        onConfirm={() => {
          if (revokeTarget) {
            revokeMutation.mutate(revokeTarget, {
              onSuccess: () => {
                setRevokeTarget(null)
                toast.success('Vouch revoked successfully.')
              },
              onError: (error) => {
                const message = error instanceof Error ? error.message : 'Failed to revoke vouch.'
                toast.error(message)
              },
            })
          }
        }}
        onCancel={() => setRevokeTarget(null)}
        revoking={revokeMutation.isPending}
      />
    </div>
  )
}
