import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { vendorsService } from '../services/vendors.service'
import { useUserStore } from '../stores/user.store'
import { useToast } from '../hooks/useToast'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const CATEGORIES = ['Electronics', 'Bootcamp', 'OnlineCourse', 'DevTools', 'Books'] as const

interface FormData {
  name: string
  category: string
  country: string
  city: string
  website: string
  description: string
}

const INITIAL_FORM: FormData = {
  name: '',
  category: '',
  country: '',
  city: '',
  website: '',
  description: '',
}

export function VendorRegister() {
  const { isAuthenticated } = useUserStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const mutation = useMutation({
    mutationFn: (data: FormData) => vendorsService.registerVendor(data),
    onSuccess: () => {
      toast.success('Vendor registered successfully!')
      navigate('/vendors')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Registration failed.')
    },
  })

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!form.name.trim()) {
      newErrors.name = 'Name is required.'
    }
    if (!form.category) {
      newErrors.category = 'Category is required.'
    }
    if (!form.country.trim()) {
      newErrors.country = 'Country is required.'
    }
    if (form.website && !/^https?:\/\/.+/.test(form.website)) {
      newErrors.website = 'Please enter a valid URL starting with http:// or https://.'
    }
    if (form.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or fewer.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return
    mutation.mutate(form)
  }

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display font-semibold text-2xl text-text-primary mb-4">
          Authentication required
        </h1>
        <p className="text-text-secondary">Connect your wallet to register as a vendor.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl text-text-primary mb-2">
          Register as Vendor
        </h1>
        <p className="text-text-muted">
          Create your vendor profile to start listing products.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-label="Vendor registration form">
          <div>
            <label htmlFor="name" className="block text-sm text-text-secondary mb-2">Name <span aria-hidden="true">*</span></label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              placeholder="Your vendor name"
              required
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1" role="alert">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm text-text-secondary mb-2">Category <span aria-hidden="true">*</span></label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              required
              aria-invalid={!!errors.category}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-400 text-sm mt-1" role="alert">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm text-text-secondary mb-2">Country <span aria-hidden="true">*</span></label>
            <input
              id="country"
              value={form.country}
              onChange={(e) => updateField('country', e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              placeholder="United States"
              required
              aria-invalid={!!errors.country}
            />
            {errors.country && <p className="text-red-400 text-sm mt-1" role="alert">{errors.country}</p>}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm text-text-secondary mb-2">City</label>
            <input
              id="city"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              placeholder="San Francisco"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm text-text-secondary mb-2">Website</label>
            <input
              id="website"
              type="url"
              value={form.website}
              onChange={(e) => updateField('website', e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              placeholder="https://example.com"
              aria-invalid={!!errors.website}
            />
            {errors.website && <p className="text-red-400 text-sm mt-1" role="alert">{errors.website}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm text-text-secondary mb-2">
              Description <span className="text-text-muted">(max 500 characters)</span>
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand resize-y"
              placeholder="Tell us about your vendor business..."
              aria-invalid={!!errors.description}
            />
            <div className="flex justify-between mt-1">
              {errors.description && <p className="text-red-400 text-sm" role="alert">{errors.description}</p>}
              <span className="text-text-muted text-xs ml-auto">{form.description.length}/500</span>
            </div>
          </div>

          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Register Vendor
          </Button>
        </form>
      </Card>
    </div>
  )
}
