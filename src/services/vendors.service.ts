import { api } from './api'
import type {
  Vendor,
  VendorDashboardOverview,
  VendorLoan,
  VendorPayment,
  VendorProduct,
  PaginatedResponse,
} from '../types'

/**
 * Backend DTO shapes (StepFi-API vendors module). New vendor endpoints wrap
 * their payload in the standard { success, data, message } envelope, so we
 * unwrap `res.data.data`. Field names are mapped to the frontend view models
 * here (single place) so pages/components stay unchanged.
 */
interface Envelope<T> {
  success: boolean
  data: T
  message: string
}

interface VendorResponseDto {
  id: string
  walletAddress: string
  name: string
  type: string
  verified: boolean
  website?: string
  country?: string
  city?: string
  description?: string
  createdAt: string
}

interface VendorDashboardDto {
  totalLoansFunded: number
  totalReceived: number
  activeBorrowers: number
  defaultRate: number
}

interface VendorLoanDto {
  id: string
  loanId: string
  borrowerWallet: string
  amount: number
  loanAmount: number
  remainingBalance: number
  status: string
  nextPaymentDue?: string | null
  createdAt: string
}

interface VendorPaymentDto {
  id: string
  loanId: string
  amount: number
  txHash: string
  paidAt: string
}

interface VendorProductDto {
  id: string
  vendorId: string
  name: string
  price: number
  category?: string | null
  description?: string | null
  createdAt: string
  updatedAt: string
}

interface Page<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const LOAN_STATUS_MAP: Record<string, VendorLoan['status']> = {
  pending: 'Pending',
  under_review: 'Pending',
  active: 'Active',
  completed: 'Repaid',
  defaulted: 'Defaulted',
  rejected: 'Defaulted',
}

// The dashboard sort control uses camelCase field names; the API whitelists
// snake_case columns.
const LOAN_SORT_MAP: Record<string, string> = {
  createdAt: 'created_at',
  amount: 'amount',
  status: 'status',
}

function mapVendor(dto: VendorResponseDto): Vendor {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.type,
    country: dto.country ?? '',
    city: dto.city,
    website: dto.website,
    description: dto.description,
  }
}

function mapLoan(dto: VendorLoanDto): VendorLoan {
  return {
    id: dto.id,
    product: dto.loanId,
    borrower: dto.borrowerWallet,
    amount: dto.amount,
    paidAmount: Math.max(0, dto.amount - dto.remainingBalance),
    installments: 0,
    paidInstallments: 0,
    status: LOAN_STATUS_MAP[dto.status] ?? 'Pending',
    createdAt: dto.createdAt,
  }
}

function mapProduct(dto: VendorProductDto): VendorProduct {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? undefined,
    price: dto.price,
    active: true,
    createdAt: dto.createdAt,
  }
}

export const vendorsService = {
  // GET /vendors — public list (raw array, no envelope). Normalized to the
  // paginated shape the Vendors page expects, with client-side filtering.
  listVendors: async (
    page = 1,
    limit = 10,
    search?: string,
    category?: string,
  ): Promise<PaginatedResponse<Vendor>> => {
    const params = new URLSearchParams()
    if (category) params.set('type', category.toLowerCase())
    const res = await api.get<VendorResponseDto[]>(`/vendors?${params}`)
    let vendors = (res.data ?? []).map(mapVendor)
    if (search) {
      const q = search.toLowerCase()
      vendors = vendors.filter((v) => v.name.toLowerCase().includes(q))
    }
    return { data: vendors, total: vendors.length, page, limit, totalPages: 1 }
  },

  getVendor: async (id: string): Promise<Vendor> => {
    const res = await api.get<VendorResponseDto>(`/vendors/${id}`)
    return mapVendor(res.data)
  },

  registerVendor: async (data: {
    name: string
    category: string
    country: string
    city?: string
    website?: string
    description?: string
  }): Promise<Vendor> => {
    const res = await api.post<Envelope<VendorResponseDto>>('/vendors', data)
    return mapVendor(res.data.data)
  },

  getDashboard: async (): Promise<VendorDashboardOverview> => {
    const res = await api.get<Envelope<VendorDashboardDto>>('/vendors/dashboard')
    const d = res.data.data
    return {
      totalLoans: d.totalLoansFunded,
      activeLoans: d.activeBorrowers,
      totalDisbursed: d.totalReceived,
      totalRepaid: d.totalReceived,
      totalProducts: 0,
    }
  },

  getLoans: async (
    page = 1,
    limit = 10,
    sort?: string,
    order?: string,
  ): Promise<PaginatedResponse<VendorLoan>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (sort) params.set('sort', LOAN_SORT_MAP[sort] ?? sort)
    if (order) params.set('order', order)
    const res = await api.get<Envelope<Page<VendorLoanDto>>>(`/vendors/loans?${params}`)
    const p = res.data.data
    return {
      data: p.items.map(mapLoan),
      total: p.total,
      page: p.page,
      limit: p.limit,
      totalPages: p.totalPages,
    }
  },

  getPayments: async (page = 1, limit = 10): Promise<VendorPayment[]> => {
    const res = await api.get<Envelope<Page<VendorPaymentDto>>>(
      `/vendors/payments?page=${page}&limit=${limit}`,
    )
    return res.data.data.items.map((dto) => ({
      id: dto.id,
      loanId: dto.loanId,
      borrower: '',
      amount: dto.amount,
      paidAt: dto.paidAt,
    }))
  },

  getProducts: async (): Promise<VendorProduct[]> => {
    const res = await api.get<Envelope<VendorProductDto[]>>('/vendors/products')
    return res.data.data.map(mapProduct)
  },

  createProduct: async (data: {
    name: string
    price: number
    category?: string
    description?: string
  }): Promise<VendorProduct> => {
    const res = await api.post<Envelope<VendorProductDto>>('/vendors/products', data)
    return mapProduct(res.data.data)
  },

  updateProduct: async (
    id: string,
    data: { name?: string; price?: number; category?: string; description?: string },
  ): Promise<VendorProduct> => {
    const res = await api.patch<Envelope<VendorProductDto>>(`/vendors/products/${id}`, data)
    return mapProduct(res.data.data)
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/vendors/products/${id}`)
  },

  getApiKeys: async () => {
    const res = await api.get('/vendors/api-keys')
    return res.data
  },

  createApiKey: async (label: string) => {
    const res = await api.post('/vendors/api-keys', { name: label, permissions: ['loans:read'] })
    return res.data
  },

  revokeApiKey: async (id: string) => {
    const res = await api.delete(`/vendors/api-keys/${id}`)
    return res.data
  },
}
