import { api } from './api'

export const vendorsService = {
  listVendors: async (page = 1, limit = 10, search?: string, category?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    const res = await api.get(`/vendors?${params}`)
    return res.data
  },

  getVendor: async (id: string) => {
    const res = await api.get(`/vendors/${id}`)
    return res.data
  },

  registerVendor: async (data: {
    name: string
    category: string
    country: string
    city?: string
    website?: string
    description?: string
  }) => {
    const res = await api.post('/vendors', data)
    return res.data
  },

  getDashboard: async () => {
    const res = await api.get('/vendors/dashboard')
    return res.data
  },

  getLoans: async (page = 1, limit = 10, sort?: string, order?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (sort) params.set('sort', sort)
    if (order) params.set('order', order)
    const res = await api.get(`/vendors/loans?${params}`)
    return res.data
  },

  getPayments: async (page = 1, limit = 10) => {
    const res = await api.get(`/vendors/payments?page=${page}&limit=${limit}`)
    return res.data
  },

  getProducts: async () => {
    const res = await api.get('/vendors/products')
    return res.data
  },

  getApiKeys: async () => {
    const res = await api.get('/vendors/api-keys')
    return res.data
  },

  createApiKey: async (label: string) => {
    const res = await api.post('/vendors/api-keys', { label })
    return res.data
  },

  revokeApiKey: async (id: string) => {
    const res = await api.delete(`/vendors/api-keys/${id}`)
    return res.data
  },
}
