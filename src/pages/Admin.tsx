import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { useAdmin, type AdminProtocolParameters } from '../hooks/useAdmin'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'

const ADMIN_WALLETS = (import.meta.env.VITE_ADMIN_WALLETS ?? '')
  .split(',')
  .map((value: string) => value.trim())
  .filter(Boolean)

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <p className="text-text-muted text-xs uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-2xl font-display font-bold text-text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </Card>
  )
}

export function Admin() {
  const { address, isConnected } = useWallet()
  const [page, setPage] = useState(1)
  const [draft, setDraft] = useState<AdminProtocolParameters>({
    maxLoanAmount: 0,
    interestRate: 0,
    repaymentWindowDays: 0,
    lateFeeRate: 0,
  })

  const {
    protocolParametersQuery,
    protocolStatsQuery,
    vendorQueueQuery,
    loanQueueQuery,
    auditLogsQuery,
    updateParametersMutation,
    approveVendorMutation,
    rejectVendorMutation,
    approveLoanMutation,
    rejectLoanMutation,
  } = useAdmin(page)

  const isAdmin = useMemo(() => {
    if (!isConnected || !address) return false
    if (!ADMIN_WALLETS.length) return false
    return ADMIN_WALLETS.includes(address)
  }, [address, isConnected])

  const handleDraftChange = (field: keyof AdminProtocolParameters, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [field]: Number(value),
    }))
  }

  const handleSaveParameters = () => {
    updateParametersMutation.mutate(draft)
  }

  if (!isConnected) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <ShieldCheck className="mx-auto mb-4 text-brand" size={48} />
        <h1 className="font-display font-bold text-3xl text-text-primary mb-3">Connect your wallet</h1>
        <p className="text-text-secondary">Use a connected wallet to continue to the admin dashboard.</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
        <h1 className="font-display font-bold text-3xl text-text-primary mb-3">Access denied</h1>
        <p className="text-text-secondary">Only authorized protocol administrators can view this page.</p>
      </div>
    )
  }

  if (protocolParametersQuery.isLoading || protocolStatsQuery.isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 flex justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  useEffect(() => {
    if (protocolParametersQuery.data) {
      setDraft(protocolParametersQuery.data)
    }
  }, [protocolParametersQuery.data])

  const stats = protocolStatsQuery.data
  const auditLogs = auditLogsQuery.data

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-text-muted text-sm font-mono mb-1">Protocol Admin</p>
          <h1 className="font-display font-bold text-3xl text-text-primary">Administration Console</h1>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-medium border border-brand/25 bg-brand/5 text-brand">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Total volume" value={`$${(stats?.totalVolume ?? 0).toLocaleString()}`} />
        <StatCard label="Active loans" value={(stats?.activeLoans ?? 0).toString()} />
        <StatCard label="Approved vendors" value={(stats?.approvedVendors ?? 0).toString()} />
        <StatCard label="Pending approvals" value={(stats?.pendingApprovals ?? 0).toString()} />
        <StatCard label="Audit events" value={(stats?.auditEvents ?? 0).toString()} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-text-primary">Protocol Parameters</h2>
            <Button size="sm" onClick={handleSaveParameters} loading={updateParametersMutation.isPending}>
              Save Changes
            </Button>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="text-text-muted text-sm">Max Loan Amount</span>
              <input
                type="number"
                value={draft.maxLoanAmount}
                onChange={(e) => handleDraftChange('maxLoanAmount', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-bg border border-border text-text-primary"
              />
            </label>
            <label className="block">
              <span className="text-text-muted text-sm">Interest Rate (%)</span>
              <input
                type="number"
                step="0.01"
                value={draft.interestRate}
                onChange={(e) => handleDraftChange('interestRate', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-bg border border-border text-text-primary"
              />
            </label>
            <label className="block">
              <span className="text-text-muted text-sm">Repayment Window (days)</span>
              <input
                type="number"
                value={draft.repaymentWindowDays}
                onChange={(e) => handleDraftChange('repaymentWindowDays', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-bg border border-border text-text-primary"
              />
            </label>
            <label className="block">
              <span className="text-text-muted text-sm">Late Fee Rate (%)</span>
              <input
                type="number"
                step="0.01"
                value={draft.lateFeeRate}
                onChange={(e) => handleDraftChange('lateFeeRate', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-bg border border-border text-text-primary"
              />
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="font-display font-bold text-xl text-text-primary mb-4">Vendor Approval Queue</h2>
          {vendorQueueQuery.isLoading ? (
            <div className="flex justify-center py-12"><Spinner size={24} /></div>
          ) : !vendorQueueQuery.data?.length ? (
            <p className="text-text-muted py-8 text-center">No vendor approvals pending.</p>
          ) : (
            <div className="space-y-3">
              {vendorQueueQuery.data.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between rounded-xl bg-elevated/50 p-3">
                  <div>
                    <p className="text-text-primary font-medium">{vendor.name}</p>
                    <p className="text-text-muted text-xs">{vendor.category} · {vendor.walletAddress.slice(0, 8)}...</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => rejectVendorMutation.mutate(vendor.id)} loading={rejectVendorMutation.isPending}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => approveVendorMutation.mutate(vendor.id)} loading={approveVendorMutation.isPending}>
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card>
          <h2 className="font-display font-bold text-xl text-text-primary mb-4">Loan Review Queue</h2>
          {loanQueueQuery.isLoading ? (
            <div className="flex justify-center py-12"><Spinner size={24} /></div>
          ) : !loanQueueQuery.data?.length ? (
            <p className="text-text-muted py-8 text-center">No loans require review.</p>
          ) : (
            <div className="space-y-3">
              {loanQueueQuery.data.map((loan) => (
                <div key={loan.id} className="rounded-xl bg-elevated/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-text-primary font-medium">{loan.purpose}</p>
                      <p className="text-text-muted text-xs">{loan.borrower.slice(0, 8)}... · {loan.vendor}</p>
                    </div>
                    <span className="text-text-primary font-semibold">${loan.amount.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => rejectLoanMutation.mutate(loan.id)} loading={rejectLoanMutation.isPending}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => approveLoanMutation.mutate(loan.id)} loading={approveLoanMutation.isPending}>
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-text-primary">Audit Log</h2>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-text-muted text-sm">{page} / {auditLogs?.totalPages ?? 1}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPage((current) => current + 1)}
                disabled={!auditLogs || page >= auditLogs.totalPages}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
          {auditLogsQuery.isLoading ? (
            <div className="flex justify-center py-12"><Spinner size={24} /></div>
          ) : !auditLogs?.data.length ? (
            <p className="text-text-muted py-8 text-center">No audit log entries found.</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.data.map((entry) => (
                <div key={entry.id} className="rounded-xl bg-elevated/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-text-primary font-medium">{entry.action}</p>
                      <p className="text-text-muted text-xs">{entry.target}</p>
                    </div>
                    <span className="text-text-muted text-xs">{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-xs text-text-secondary font-mono">Actor: {entry.actor}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
