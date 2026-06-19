# For Vendors

Vendors list their products on StepFi and get paid upfront. Learners repay in installments — you never chase payments.

## How It Works

1. **Register as a vendor** — Submit your business details for verification
2. **List your products** — Add laptops, courses, dev tools, and other learning resources
3. **Get paid upfront** — When a learner purchases through StepFi, you receive full payment immediately
4. **Track everything** — Monitor loans, payments, and products from your dashboard

## Registering as a Vendor

```typescript
// Vendor registration payload
interface VendorRegistration {
  businessName: string
  contactEmail: string
  website?: string
}
```

Navigate to `/vendors/register` and submit the form. Our team will review your application.

## Listing Products

Once approved, you can list products through the vendor dashboard or API:

```bash
curl -X POST https://stepfi-api.onrender.com/api/v1/vendors/products \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Air M3",
    "description": "15-inch, 16GB RAM, 512GB SSD",
    "price": 129900
  }'
```

## Vendor Dashboard

The dashboard at `/vendors/dashboard` provides:

```text
Overview Cards
├── Total Loans
├── Active Loans
├── Total Disbursed
└── Total Repaid

Sections
├── Active Loans Table (sortable, paginated)
├── Payment History
├── Products
└── API Keys
```

## API Key Management

Generate API keys from your dashboard to integrate programmatically:

```typescript
// Example: Creating an API key
const apiKey = await vendorsService.createApiKey('production')
console.log(`Key: ${apiKey.key}`)
// ⚠️ Copy the key now — it won't be shown again
```

## Product Categories

StepFi supports a wide range of learning-related products:

- Electronics (laptops, tablets, monitors)
- Online courses & bootcamps
- Developer tools & software
- Books & learning materials
- Subscriptions (cloud services, IDEs)
