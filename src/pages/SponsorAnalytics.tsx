import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  TrendingUp, PieChart as PieIcon, BarChart3,
  Shield, Download, AlertTriangle,
} from 'lucide-react'
import { sponsorsService } from '../services/sponsors.service'
import { useWallet } from '../hooks/useWallet'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import type { SponsorAnalytics, YieldPoint, FundedLoanCategory, RepaymentRateItem, RiskMetrics } from '../types'

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; name: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-elevated border border-border rounded-xl px-4 py-3 shadow-lg">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-text-primary text-sm font-medium">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  )
}

function YieldLineChart({ data }: { data?: YieldPoint[] }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted">
        No yield data available.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,82,0.4)" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6B8CA8', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(30,58,82,0.4)' }}
        />
        <YAxis
          tick={{ fill: '#6B8CA8', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="yieldAmount"
          name="Yield (USDC)"
          stroke="#22C55E"
          strokeWidth={2.5}
          dot={{ fill: '#22C55E', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: '#22C55E' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function FundedLoansPieChart({ data }: { data?: FundedLoanCategory[] }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted">
        No loan breakdown data available.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function RepaymentBarChart({ data }: { data?: RepaymentRateItem[] }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted">
        No repayment rate data available.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,82,0.4)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#6B8CA8', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(30,58,82,0.4)' }}
        />
        <YAxis
          tick={{ fill: '#6B8CA8', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}%`}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="rate" name="Repayment Rate" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i % 2 === 0 ? '#22C55E' : '#2563EB'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function RiskMetricCard({ label, value, icon: Icon, color, suffix }: {
  label: string
  value: string
  icon: typeof TrendingUp
  color: string
  suffix?: string
}) {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <p className="text-text-muted text-xs font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-text-primary font-display font-bold text-2xl">
        {value}
        {suffix && <span className="text-text-muted text-sm font-normal ml-1">{suffix}</span>}
      </p>
    </Card>
  )
}

function RiskMetricsGrid({ data }: { data?: RiskMetrics }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-32 text-text-muted">
        No risk metrics available.
      </div>
    )
  }

  const metrics: {
    label: string
    value: string
    icon: typeof TrendingUp
    color: string
    suffix?: string
  }[] = [
    {
      label: 'Default Rate',
      value: `${data.defaultRate.toFixed(1)}`,
      icon: AlertTriangle,
      color: data.defaultRate > 10 ? '#EF4444' : data.defaultRate > 5 ? '#F59E0B' : '#22C55E',
      suffix: '%',
    },
    {
      label: 'Average LTV',
      value: `${data.averageLtv.toFixed(1)}`,
      icon: TrendingUp,
      color: '#2563EB',
      suffix: '%',
    },
    {
      label: 'Concentration Risk',
      value: `${data.concentrationRisk.toFixed(1)}`,
      icon: BarChart3,
      color: data.concentrationRisk > 50 ? '#EF4444' : data.concentrationRisk > 30 ? '#F59E0B' : '#22C55E',
      suffix: '%',
    },
    {
      label: 'Pool Health',
      value: `${data.poolHealth.toFixed(1)}`,
      icon: Shield,
      color: data.poolHealth > 80 ? '#22C55E' : data.poolHealth > 60 ? '#F59E0B' : '#EF4444',
      suffix: '%',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <RiskMetricCard key={m.label} {...m} />
      ))}
    </div>
  )
}

function exportAnalyticsCsv(data: SponsorAnalytics) {
  const rows: Record<string, string | number>[] = []

  data.yieldOverTime.forEach((p, i) => {
    rows.push({
      Date: p.date,
      'Yield (USDC)': p.yieldAmount,
      'Loan Category': data.fundedLoansBreakdown[i]?.name ?? '',
      'Loans Count': data.fundedLoansBreakdown[i]?.value ?? '',
      'Repayment Month': data.repaymentRate[i]?.month ?? '',
      'Repayment Rate (%)': data.repaymentRate[i]?.rate ?? '',
    })
  })

  while (rows.length < Math.max(data.fundedLoansBreakdown.length, data.repaymentRate.length)) {
    const i = rows.length
    rows.push({
      Date: '',
      'Yield (USDC)': '',
      'Loan Category': data.fundedLoansBreakdown[i]?.name ?? '',
      'Loans Count': data.fundedLoansBreakdown[i]?.value ?? '',
      'Repayment Month': data.repaymentRate[i]?.month ?? '',
      'Repayment Rate (%)': data.repaymentRate[i]?.rate ?? '',
    })
  }

  rows.push({} as Record<string, string | number>)
  rows.push({ 'Date': 'Risk Metrics' } as Record<string, string | number>)
  rows.push({
    'Date': 'Default Rate',
    'Yield (USDC)': `${data.riskMetrics.defaultRate}%`,
  } as Record<string, string | number>)
  rows.push({
    'Date': 'Average LTV',
    'Yield (USDC)': `${data.riskMetrics.averageLtv}%`,
  } as Record<string, string | number>)
  rows.push({
    'Date': 'Concentration Risk',
    'Yield (USDC)': `${data.riskMetrics.concentrationRisk}%`,
  } as Record<string, string | number>)
  rows.push({
    'Date': 'Pool Health',
    'Yield (USDC)': `${data.riskMetrics.poolHealth}%`,
  } as Record<string, string | number>)

  const headers = Object.keys(rows[0] || {})
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => r[h] ?? '').join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sponsor-analytics.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function SponsorAnalytics() {
  const { isConnected } = useWallet()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStart, setAppliedStart] = useState('')
  const [appliedEnd, setAppliedEnd] = useState('')

  const { data, isLoading, isError, error } = useQuery<SponsorAnalytics>({
    queryKey: ['sponsor-analytics', appliedStart, appliedEnd],
    queryFn: () => sponsorsService.getAnalytics(appliedStart || undefined, appliedEnd || undefined),
    enabled: isConnected,
  })

  const handleApply = useCallback(() => {
    setAppliedStart(startDate)
    setAppliedEnd(endDate)
  }, [startDate, endDate])

  const handleReset = useCallback(() => {
    setStartDate('')
    setEndDate('')
    setAppliedStart('')
    setAppliedEnd('')
  }, [])

  const handleExport = useCallback(() => {
    if (data) exportAnalyticsCsv(data)
  }, [data])

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display font-bold text-3xl text-text-primary mb-4">
          Connect your wallet to view analytics
        </h1>
        <p className="text-text-secondary mb-8">
          You need a Stellar wallet to access sponsor analytics.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary mb-1">
            Sponsor Analytics
          </h1>
          <p className="text-text-muted">
            Track your yield performance, loan distribution, and risk exposure.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
          <Download size={14} /> CSV Export
        </Button>
      </div>

      <Card className="mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label htmlFor="analytics-from" className="block text-sm text-text-muted mb-1">
              From
            </label>
            <input
              id="analytics-from"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-bg border border-border text-text-primary
                text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <div>
            <label htmlFor="analytics-to" className="block text-sm text-text-muted mb-1">
              To
            </label>
            <input
              id="analytics-to"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-bg border border-border text-text-primary
                text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
          <Button size="sm" variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size={32} />
        </div>
      ) : isError ? (
        <Card className="border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <div>
              <p className="text-text-primary font-medium">Failed to load analytics</p>
              <p className="text-text-muted text-sm mt-1">
                {error instanceof Error ? error.message : 'An unexpected error occurred.'}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          <section aria-label="Yield over time chart">
            <Card>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-brand/10 rounded-lg">
                  <TrendingUp className="text-brand" size={18} />
                </div>
                <h2 className="font-display font-bold text-lg text-text-primary">
                  Yield Over Time
                </h2>
              </div>
              <YieldLineChart data={data?.yieldOverTime} />
            </Card>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section aria-label="Funded loans breakdown chart">
              <Card>
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <PieIcon className="text-blue-500" size={18} />
                  </div>
                  <h2 className="font-display font-bold text-lg text-text-primary">
                    Funded Loans Breakdown
                  </h2>
                </div>
                <FundedLoansPieChart data={data?.fundedLoansBreakdown} />
              </Card>
            </section>

            <section aria-label="Repayment rate chart">
              <Card>
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-brand/10 rounded-lg">
                    <BarChart3 className="text-brand" size={18} />
                  </div>
                  <h2 className="font-display font-bold text-lg text-text-primary">
                    Repayment Rate
                  </h2>
                </div>
                <RepaymentBarChart data={data?.repaymentRate} />
              </Card>
            </section>
          </div>

          <section aria-label="Risk metrics cards">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Shield className="text-amber-500" size={18} />
              </div>
              <h2 className="font-display font-bold text-lg text-text-primary">
                Risk Metrics
              </h2>
            </div>
            <RiskMetricsGrid data={data?.riskMetrics} />
          </section>
        </div>
      )}
    </div>
  )
}
