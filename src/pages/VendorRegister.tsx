import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useToast } from '../hooks/useToast'

export function VendorRegister() {
  const { toast } = useToast()
  const [form, setForm] = useState({
    businessName: '',
    contactEmail: '',
    website: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!form.businessName.trim()) {
      newErrors.businessName = 'Business name is required.'
    }
    if (!form.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      newErrors.contactEmail = 'Please provide a valid email address.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error(Object.values(newErrors)[0])
      return
    }

    toast.success('Vendor registration request submitted successfully.')
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-text-primary mb-2">
          Register as Vendor
        </h1>
        <p className="text-text-muted">
          Share your details and we will review your vendor application.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate
          aria-label="Vendor registration form"
        >
          <div>
            <label htmlFor="businessName" className="block text-sm text-text-secondary mb-2">Business name <span aria-hidden="true">*</span></label>
            <input
              id="businessName"
              name="businessName"
              value={form.businessName}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, businessName: e.target.value }))
                if (errors.businessName && e.target.value.trim()) {
                  setErrors((prev) => { const { businessName: _, ...rest } = prev; return rest })
                }
              }}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              placeholder="StepFi Education"
              required
              aria-required="true"
              aria-invalid={!!errors.businessName}
              aria-describedby={errors.businessName ? 'businessName-error' : undefined}
            />
            {errors.businessName && (
              <p id="businessName-error" className="text-red-400 text-sm mt-1" role="alert">{errors.businessName}</p>
            )}
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-sm text-text-secondary mb-2">Contact email <span aria-hidden="true">*</span></label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, contactEmail: e.target.value }))
                if (errors.contactEmail && e.target.value.trim()) {
                  setErrors((prev) => { const { contactEmail: _, ...rest } = prev; return rest })
                }
              }}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              placeholder="vendor@example.com"
              required
              aria-required="true"
              aria-invalid={!!errors.contactEmail}
              aria-describedby={errors.contactEmail ? 'contactEmail-error' : undefined}
            />
            {errors.contactEmail && (
              <p id="contactEmail-error" className="text-red-400 text-sm mt-1" role="alert">{errors.contactEmail}</p>
            )}
          </div>

          <div>
            <label htmlFor="website" className="block text-sm text-text-secondary mb-2">Website (optional)</label>
            <input
              id="website"
              name="website"
              type="url"
              value={form.website}
              onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              placeholder="https://example.com"
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Registration
          </Button>
        </form>
      </Card>
    </div>
  )
}
