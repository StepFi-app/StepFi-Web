import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { fetchTransactions, stellarExpertUrl } from '../services/history.service'
import type { Transaction, TransactionType, TransactionStatus } from '../services/history.service'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Download } from 'lucide-react'

function formatDate(d: string) {
  return new Date(d).toLocaleString()
}

export function History() {
  const { address, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    if (!isConnected || !address) return

    let isMounted = true

    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchTransactions(address, {
          type: (filterType || undefined) as TransactionType | undefined,
          status: (filterStatus || undefined) as TransactionStatus | undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        })
        if (isMounted) setTransactions(data)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [isConnected, address, filterType, filterStatus, fromDate, toDate])

  const pending = useMemo(
    () => transactions.filter((t) => t.status === 'pending'),
    [transactions]
  )

  function exportCsv() {
    const rows = transactions.map((t) => ({
      id: t.id,
      hash: t.hash,
      type: t.type,
      amount: t.amount,
      asset: t.asset || 'XLM',
      from: t.from,
      to: t.to,
      status: t.status,
      createdAt: t.createdAt,
    }))
    const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map(r => Object.values(r).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display font-semibold text-xl text-text-primary mb-4">
          Connect your wallet to view history
        </h2>
        <Link to="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Transaction History</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-sm text-text-muted block mb-1">Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 rounded-lg bg-bg">
              <option value="">All</option>
              <option value="payment">Payment</option>
              <option value="repayment">Repayment</option>
              <option value="loan_disbursement">Disbursement</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-text-muted block mb-1">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 rounded-lg bg-bg">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-text-muted block mb-1">From</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="p-2 rounded-lg bg-bg" />
          </div>

          <div>
            <label className="text-sm text-text-muted block mb-1">To</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="p-2 rounded-lg bg-bg" />
          </div>

        </div>
      </Card>

      {pending.length > 0 && (
        <Card className="mb-6">
          <h3 className="font-semibold mb-3">Pending Transactions</h3>
          <ul className="space-y-3">
            {pending.map(t => (
              <li key={t.id} className="flex justify-between">
                <div>
                  <div className="font-medium">{t.type} — {t.amount} {t.asset || 'XLM'}</div>
                  <div className="text-sm text-text-muted">{formatDate(t.createdAt)}</div>
                </div>
                <div className="text-sm text-text-muted">{t.status}</div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <Card>Loading...</Card>
        ) : (
          transactions.sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt)).map(tx => (
            <Card key={tx.id} hover>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">{tx.type} — {tx.amount} {tx.asset || 'XLM'}</div>
                  <div className="text-sm text-text-muted">{formatDate(tx.createdAt)}</div>
                  <div className="text-sm mt-2">
                    <a href={stellarExpertUrl(tx)} target="_blank" rel="noreferrer" className="text-brand underline">View on Stellar Expert</a>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-text-muted mb-2">{tx.status}</div>
                  <details>
                    <summary className="cursor-pointer text-sm text-brand">Details</summary>
                    <pre className="text-xs mt-2 bg-bg p-2 rounded">{JSON.stringify(tx, null, 2)}</pre>
                  </details>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
