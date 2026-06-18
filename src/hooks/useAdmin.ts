import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export interface AdminProtocolParameters {
  maxLoanAmount: number
  interestRate: number
  repaymentWindowDays: number
  lateFeeRate: number
}

export interface AdminProtocolStats {
  totalVolume: number
  activeLoans: number
  approvedVendors: number
  pendingApprovals: number
  auditEvents: number
}

export interface PendingVendor {
  id: string
  name: string
  walletAddress: string
  category: string
  submittedAt: string
}

export interface PendingLoan {
  id: string
  borrower: string
  vendor: string
  amount: number
  purpose: string
  requestedAt: string
}

export interface AuditLogEntry {
  id: string
  actor: string
  action: string
  target: string
  createdAt: string
}

export interface PaginatedAuditLogs {
  data: AuditLogEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useAdmin(page = 1) {
  const queryClient = useQueryClient()

  const protocolParametersQuery = useQuery({
    queryKey: ['admin-parameters'],
    queryFn: async () => {
      const res = await api.get<AdminProtocolParameters>('/admin/protocol-parameters')
      return res.data
    },
  })

  const protocolStatsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get<AdminProtocolStats>('/admin/stats')
      return res.data
    },
  })

  const vendorQueueQuery = useQuery({
    queryKey: ['admin-vendor-queue'],
    queryFn: async () => {
      const res = await api.get<PendingVendor[]>('/admin/vendors/approvals')
      return res.data
    },
  })

  const loanQueueQuery = useQuery({
    queryKey: ['admin-loan-queue'],
    queryFn: async () => {
      const res = await api.get<PendingLoan[]>('/admin/loans/review')
      return res.data
    },
  })

  const auditLogsQuery = useQuery({
    queryKey: ['admin-audit-logs', page],
    queryFn: async () => {
      const res = await api.get<PaginatedAuditLogs>(`/admin/audit-logs?page=${page}&limit=10`)
      return res.data
    },
  })

  const updateParametersMutation = useMutation({
    mutationFn: async (params: AdminProtocolParameters) => {
      const res = await api.put('/admin/protocol-parameters', params)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-parameters'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const approveVendorMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/vendors/${id}/approve`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-queue'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const rejectVendorMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/vendors/${id}/reject`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-queue'] })
    },
  })

  const approveLoanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/loans/${id}/approve`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loan-queue'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const rejectLoanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/loans/${id}/reject`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loan-queue'] })
    },
  })

  return {
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
  }
}
