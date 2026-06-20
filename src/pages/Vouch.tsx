import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, ShieldCheck, Award, AlertTriangle, RotateCw, Clock, DollarSign, Percent, Ban, ExternalLink, XCircle } from 'lucide-react'
import { signTransaction, isConnected, requestAccess } from '@stellar/freighter-api'
import { vouchingService } from '../services/vouching.service'
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

export function Vouch() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isConnected: walletConnected, connectFreighter } = useWallet()

  const [activeTab, setActiveTab] = useState<'requests' | 'active'>('requests')
  const [previewRequest, setPreviewRequest] = useState<VouchRequest | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null)
  const [decliningId, setDecliningId] = useState<string | null>(null)

  const requestsQuery = useQuery({
    queryKey: ['vouch-requests'],
    queryFn: vouchingService.getVouchRequests,
  })

  const activeVouchesQuery = useQuery({
    queryKey: ['my-vouches'],
    queryFn: vouchingService.getMyVouches,
  })

  const submitMutation = useMutation({
    mutationFn: ({ learnerAddress, txHash }: { learnerAddress: string; txHash: string }) =>
      vouchingService.submitVouch(learnerAddress, txHash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouch-requests'] })
      queryClient.invalidateQueries({ queryKey: ['my-vouches'] })
      setPreviewRequest(null)
      toast.success('Vouch submitted successfully.')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to submit vouch.'
      toast.error(message)
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => vouchingService.revokeVouch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vouches'] })
      setRevokeTarget(null)
      toast.success('Vouch revoked successfully.')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to revoke vouch.'
      toast.error(message)
    },
  })

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

      submitMutation.mutate({
        learnerAddress: previewRequest.learnerAddress,
        txHash,
      })
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
      count: requestsQuery.data?.length,
    },
    {
      key: 'active' as const,
      label: 'My Active Vouches',
      icon: ShieldCheck,
      count: activeVouchesQuery.data?.length,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary mb-1">
            Mentor Vouching
          </h1>
          <p className="text-text-muted">
            Vouch for learners and help them access better loan terms.
          </p>
        </div>
        {!walletConnected && (
          <Button onClick={connectFreighter}>
            <Award size={16} />
            Connect Wallet to Vouch
          </Button>
        )}
      </div>

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
          {requestsQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Spinner size={28} />
              <p className="text-text-muted text-sm">Loading vouch requests...</p>
            </div>
          ) : requestsQuery.isError ? (
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
              <Button variant="outline" onClick={() => requestsQuery.refetch()}>
                <RotateCw size={14} />
                Retry
              </Button>
            </div>
          ) : !requestsQuery.data?.length ? (
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
              {requestsQuery.data.map((request) => (
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
          {activeVouchesQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Spinner size={28} />
              <p className="text-text-muted text-sm">Loading active vouches...</p>
            </div>
          ) : activeVouchesQuery.isError ? (
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
              <Button variant="outline" onClick={() => activeVouchesQuery.refetch()}>
                <RotateCw size={14} />
                Retry
              </Button>
            </div>
          ) : !activeVouchesQuery.data?.length ? (
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
              {activeVouchesQuery.data.map((vouch) => (
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
          if (revokeTarget) revokeMutation.mutate(revokeTarget)
        }}
        onCancel={() => setRevokeTarget(null)}
        revoking={revokeMutation.isPending}
      />
    </div>
  )
}
