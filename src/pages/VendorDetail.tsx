import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Star, Globe, FileText, Store, ArrowLeft } from 'lucide-react'
import { vendorsService } from '../services/vendors.service'
import { queryKeys } from '../services/queryKeys'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import type { Vendor } from '../types'

export function VendorDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: vendor, isLoading, error } = useQuery<Vendor>({
    queryKey: queryKeys.vendors.detail(id!),
    queryFn: () => vendorsService.getVendor(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <Store className="mx-auto text-text-muted mb-4" size={32} />
        <h1 className="font-display font-semibold text-2xl text-text-primary mb-2">Vendor not found</h1>
        <p className="text-text-muted mb-6">The vendor you're looking for doesn't exist.</p>
        <Link to="/vendors" className="text-brand hover:underline">Back to vendors</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link
        to="/vendors"
        className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft size={18} />
        Back to vendors
      </Link>

      <Card>
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-xl bg-brand/10">
            <Store className="text-brand" size={32} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-semibold text-2xl text-text-primary mb-2">{vendor.name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge label={vendor.category} variant="green" />
              <div className="flex items-center gap-1 text-text-muted text-sm">
                <MapPin size={14} />
                <span>{vendor.country}{vendor.city ? `, ${vendor.city}` : ''}</span>
              </div>
              {vendor.rating !== undefined && (
                <div className="flex items-center gap-1 text-text-muted text-sm">
                  <Star size={14} className="text-amber-400" />
                  <span>{vendor.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {vendor.description && (
          <div className="mb-6">
            <h2 className="font-display font-bold text-lg text-text-primary mb-2 flex items-center gap-2">
              <FileText size={18} className="text-text-muted" />
              About
            </h2>
            <p className="text-text-secondary leading-relaxed">{vendor.description}</p>
          </div>
        )}

        {vendor.website && (
          <a
            href={vendor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand hover:underline"
          >
            <Globe size={16} />
            {vendor.website}
          </a>
        )}
      </Card>
    </div>
  )
}
