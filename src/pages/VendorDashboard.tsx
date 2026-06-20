import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BarChart3, DollarSign, Package, CreditCard,
  Download, ChevronUp, ChevronDown,
  Plus, Trash2, Copy, Check
} from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { vendorsService } from '../services/vendors.service'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import type {
  VendorDashboardOverview, VendorLoan, VendorPayment,
  VendorProduct, ApiKey, PaginatedResponse
} from '../types'

const STATUS_VARIANT: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'muted'> = {
  Active: 'green',
  Pending: 'amber',
  Repaid: 'blue',
  Defaulted: 'red',
}

function OverviewCards({ overview, isLoading }: { overview?: VendorDashboardOverview; isLoading: boolean }) {
  const cards = [
    { label: 'Total Loans', value: overview?.totalLoans ?? 0, icon: BarChart3, color: '#22C55E' },
    { label: 'Active Loans', value: overview?.activeLoans ?? 0, icon: CreditCard, color: '#2563EB' },
    { label: 'Total Disbursed', value: `$${overview?.totalDisbursed?.toLocaleString() ?? 0}`, icon: DollarSign, color: '#F59E0B' },
    { label: 'Total Repaid', value: `$${overview?.totalRepaid?.toLocaleString() ?? 0}`, icon: Package, color: '#22C55E' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <Card key={card.label}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: `${card.color}15` }}>
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-text-muted text-xs font-medium uppercase tracking-wider">{card.label}</p>
              {isLoading ? (
                <div className="h-6 w-20 bg-elevated rounded animate-pulse mt-1" />
              ) : (
                <p className="text-text-primary font-display font-bold text-xl">{card.value}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function SortIcon({ field, sortField, sortOrder }: { field: string; sortField: string; sortOrder: string }) {
  if (field !== sortField) return <ChevronUp size={14} className="opacity-30" />
  return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
}

function LoansTable({
  data,
  isLoading,
  sortField,
  sortOrder,
  onSort,
  page,
  totalPages,
  onPageChange,
}: {
  data?: VendorLoan[]
  isLoading: boolean
  sortField: string
  sortOrder: 'asc' | 'desc'
  onSort: (field: string) => void
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'product', label: 'Product' },
    { key: 'borrower', label: 'Borrower' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
  ]

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg text-text-primary">Active Loans</h3>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs">{page} / {totalPages}</span>
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-2 py-1 rounded-lg text-text-secondary hover:text-text-primary
              disabled:opacity-30 disabled:cursor-not-allowed text-sm border border-border"
          >
            Prev
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-2 py-1 rounded-lg text-text-secondary hover:text-text-primary
              disabled:opacity-30 disabled:cursor-not-allowed text-sm border border-border"
          >
            Next
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : !data?.length ? (
        <div className="text-center py-16 text-text-muted">No loans found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Active loans table">
            <caption className="sr-only">Active loans with sortable columns</caption>
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => onSort(col.key)}
                    scope="col"
                    className="text-left py-3 px-3 text-text-muted font-medium cursor-pointer
                      hover:text-text-primary transition-colors select-none"
                    aria-label={`${col.label} column. Click to sort.`}
                    aria-sort={
                      sortField === col.key
                        ? sortOrder === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.key} sortField={sortField} sortOrder={sortOrder} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((loan) => (
                <tr key={loan.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 text-text-muted font-mono text-xs">{loan.id.slice(0, 8)}...</td>
                  <td className="py-3 px-3 text-text-primary">{loan.product}</td>
                  <td className="py-3 px-3 text-text-secondary font-mono text-xs">
                    {loan.borrower.slice(0, 6)}...{loan.borrower.slice(-4)}
                  </td>
                  <td className="py-3 px-3 text-text-primary font-mono">${loan.amount.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <Badge label={loan.status} variant={STATUS_VARIANT[loan.status] ?? 'muted'} />
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
  )
}

function PaymentHistory({ payments, isLoading }: { payments?: VendorPayment[]; isLoading: boolean }) {
  return (
    <Card className="mb-8">
      <h3 className="font-display font-bold text-lg text-text-primary mb-4">Payment History</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size={24} />
        </div>
      ) : !payments?.length ? (
        <div className="text-center py-12 text-text-muted">No payments yet.</div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between py-3 px-4 rounded-xl bg-elevated/50"
            >
              <div>
                <p className="text-text-primary text-sm font-medium">
                  ${payment.amount.toLocaleString()}
                </p>
                <p className="text-text-muted text-xs font-mono">
                  {payment.borrower.slice(0, 6)}...{payment.borrower.slice(-4)}
                </p>
              </div>
              <span className="text-text-muted text-xs">
                {new Date(payment.paidAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function ProductsSection({ products, isLoading }: { products?: VendorProduct[]; isLoading: boolean }) {
  return (
    <Card className="mb-8">
      <h3 className="font-display font-bold text-lg text-text-primary mb-4">Products</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size={24} />
        </div>
      ) : !products?.length ? (
        <div className="text-center py-12 text-text-muted">No products listed.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-4 rounded-xl border border-border bg-elevated/30"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-text-primary font-medium text-sm">{product.name}</h4>
                <Badge label={product.active ? 'Active' : 'Inactive'} variant={product.active ? 'green' : 'muted'} />
              </div>
              {product.description && (
                <p className="text-text-muted text-xs mb-3">{product.description}</p>
              )}
              <p className="text-text-primary font-display font-bold text-lg">${product.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function ApiKeySection({
  apiKeys,
  isLoading,
  generatedKey,
  onCreateKey,
  onRevokeKey,
  onClearGeneratedKey,
  isCreating,
}: {
  apiKeys?: ApiKey[]
  isLoading: boolean
  generatedKey: string
  onCreateKey: (label: string) => void
  onRevokeKey: (id: string) => void
  onClearGeneratedKey: () => void
  isCreating: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCreate = () => {
    if (!label.trim()) return
    onCreateKey(label.trim())
    setLabel('')
    setShowForm(false)
  }

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(key)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg text-text-primary">API Keys</h3>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Plus size={14} /> New Key
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-4 p-4 rounded-xl border border-brand/20 bg-brand/5">
          <p className="text-text-secondary text-sm mb-3">Create a new API key</p>
          <div className="flex gap-2">
            <label htmlFor="api-key-label" className="sr-only">API key label</label>
            <input
              id="api-key-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Production"
              className="flex-1 px-3 py-2 rounded-xl bg-bg border border-border
                text-text-primary text-sm placeholder:text-text-muted
                focus:outline-none focus:border-brand/40"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button size="sm" onClick={handleCreate} loading={isCreating}>Generate</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {generatedKey && (
        <div className="mb-4 p-4 rounded-xl border border-brand/20 bg-brand/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-brand" />
              <span className="text-text-primary text-sm font-medium">Key generated</span>
            </div>
            <button
              onClick={onClearGeneratedKey}
              className="text-text-muted hover:text-text-primary text-xs"
            >
              Dismiss
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg bg-bg text-text-primary font-mono text-xs break-all">
              {generatedKey}
            </code>
            <button
              onClick={() => handleCopy(generatedKey)}
              className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-brand transition-colors"
            >
              {copiedId === generatedKey ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-text-muted text-xs mt-2">Copy this key now. You won't be able to see it again.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size={24} />
        </div>
      ) : !apiKeys?.length ? (
        <div className="text-center py-12 text-text-muted">No API keys created.</div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between py-3 px-4 rounded-xl bg-elevated/50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-text-primary text-sm font-medium">{key.label}</span>
                  <Badge label={key.revoked ? 'Revoked' : 'Active'} variant={key.revoked ? 'red' : 'green'} />
                </div>
                <p className="text-text-muted text-xs font-mono mt-0.5">
                  {key.prefix}... · Created {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsedAt && ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                </p>
              </div>
              {!key.revoked && (
                <button
                  onClick={() => onRevokeKey(key.id)}
                  className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Revoke key"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export function VendorDashboard() {
  const { address, isConnected } = useWallet()
  const queryClient = useQueryClient()
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [generatedKey, setGeneratedKey] = useState('')
  const limit = 10

  const overviewQuery = useQuery<VendorDashboardOverview>({
    queryKey: ['vendor-dashboard'],
    queryFn: () => vendorsService.getDashboard(),
    enabled: isConnected,
  })

  const loansQuery = useQuery<PaginatedResponse<VendorLoan>>({
    queryKey: ['vendor-loans', page, sortField, sortOrder, limit],
    queryFn: () => vendorsService.getLoans(page, limit, sortField, sortOrder),
    enabled: isConnected,
  })

  const paymentsQuery = useQuery<VendorPayment[]>({
    queryKey: ['vendor-payments'],
    queryFn: () => vendorsService.getPayments(),
    enabled: isConnected,
  })

  const productsQuery = useQuery<VendorProduct[]>({
    queryKey: ['vendor-products'],
    queryFn: () => vendorsService.getProducts(),
    enabled: isConnected,
  })

  const apiKeysQuery = useQuery<ApiKey[]>({
    queryKey: ['vendor-api-keys'],
    queryFn: () => vendorsService.getApiKeys(),
    enabled: isConnected,
  })

  const createKeyMutation = useMutation({
    mutationFn: (label: string) => vendorsService.createApiKey(label),
    onSuccess: (data) => {
      setGeneratedKey(data.key)
      queryClient.invalidateQueries({ queryKey: ['vendor-api-keys'] })
    },
  })

  const revokeKeyMutation = useMutation({
    mutationFn: (id: string) => vendorsService.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-api-keys'] })
    },
  })

  const handleSort = useCallback((field: string) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortOrder('desc')
      return field
    })
    setPage(1)
  }, [])

  const exportCSV = useCallback(() => {
    const loans = loansQuery.data?.data
    if (!loans?.length) return
    const headers = ['ID', 'Product', 'Borrower', 'Amount', 'Paid', 'Status', 'Created']
    const rows = loans.map((l) => [l.id, l.product, l.borrower, l.amount, l.paidAmount, l.status, l.createdAt])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vendor-loans.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [loansQuery.data])

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display font-bold text-3xl text-text-primary mb-4">
          Connect your wallet to continue
        </h1>
        <p className="text-text-secondary mb-8">
          You need a Stellar wallet to access the vendor dashboard.
        </p>
      </div>
    )
  }

  const totalPages = loansQuery.data?.totalPages ?? 1

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-text-muted text-sm font-mono mb-1">Vendor Dashboard</p>
          <h1 className="font-display font-bold text-3xl text-text-primary">
            {address.slice(0, 8)}...{address.slice(-6)}
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={!loansQuery.data?.data?.length}>
          <Download size={14} /> CSV Export
        </Button>
      </div>

      <OverviewCards overview={overviewQuery.data} isLoading={overviewQuery.isLoading} />

      <div className="mb-8">
        <LoansTable
          data={loansQuery.data?.data}
          isLoading={loansQuery.isLoading}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PaymentHistory payments={paymentsQuery.data} isLoading={paymentsQuery.isLoading} />
        <ProductsSection products={productsQuery.data} isLoading={productsQuery.isLoading} />
      </div>

      <ApiKeySection
        apiKeys={apiKeysQuery.data}
        isLoading={apiKeysQuery.isLoading}
        generatedKey={generatedKey}
        onCreateKey={(label) => createKeyMutation.mutate(label)}
        onRevokeKey={(id) => revokeKeyMutation.mutate(id)}
        onClearGeneratedKey={() => setGeneratedKey('')}
        isCreating={createKeyMutation.isPending}
      />
    </div>
  )
}
