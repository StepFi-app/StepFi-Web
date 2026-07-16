import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, MapPin, Star, Store } from 'lucide-react'
import { vendorsService } from '../services/vendors.service'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import type { Vendor, PaginatedResponse } from '../types'

const CATEGORIES = ['All', 'Electronics', 'Bootcamp', 'OnlineCourse', 'DevTools', 'Books']

export function Vendors() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const limit = 12

  const { data, isLoading, error } = useQuery<PaginatedResponse<Vendor>>({
    queryKey: ['vendors', page, limit, search, category],
    queryFn: () => vendorsService.listVendors(
      page,
      limit,
      search || undefined,
      category === 'All' ? undefined : category,
    ),
  })

  const vendors = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl text-text-primary mb-2">Vendors</h1>
        <p className="text-text-muted">Browse verified learning vendors.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search vendors..."
            className="w-full bg-bg border border-border rounded-xl pl-11 pr-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          className="bg-bg border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-brand transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Spinner size={32} />
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-24">
          <Store className="mx-auto text-text-muted mb-4" size={48} />
          <p className="text-red-400">Failed to load vendors. Please try again.</p>
        </div>
      )}

      {!isLoading && !error && vendors.length === 0 && (
        <div className="text-center py-24">
          <Store className="mx-auto text-text-muted mb-4" size={48} />
          <p className="text-text-muted">No vendors found.</p>
        </div>
      )}

      {!isLoading && !error && vendors.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {vendors.map((vendor) => (
              <Link key={vendor.id} to={`/vendors/${vendor.id}`} className="block group">
                <Card hover className="h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-brand/10">
                      <Store className="text-brand" size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-text-primary font-semibold truncate group-hover:text-brand transition-colors">
                        {vendor.name}
                      </h3>
                      <Badge label={vendor.category} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-text-muted text-sm">
                      <MapPin size={14} />
                      <span>{vendor.country}</span>
                    </div>
                    {vendor.rating !== undefined && (
                      <div className="flex items-center gap-2 text-text-muted text-sm">
                        <Star size={14} className="text-amber-400" />
                        <span>{vendor.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed text-sm border border-border"
              >
                Previous
              </button>
              <span className="text-text-muted text-sm px-4">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed text-sm border border-border"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
