# API Reference

The StepFi REST API provides programmatic access to all protocol features. The base URL is:

```
https://stepfi-api.onrender.com/api/v1
```

## Authentication

Most endpoints require a JWT token obtained through wallet authentication.

```typescript
// Get nonce
const { nonce } = await authService.getNonce(walletAddress)

// Sign with Freighter and verify
const { token } = await authService.verify({
  walletAddress,
  signedMessage: signedNonce,
})
```

Include the token in subsequent requests:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://stepfi-api.onrender.com/api/v1/pool/info
```

## Endpoints

### Pool

```typescript
GET /api/v1/pool/info
```

Returns the current liquidity pool state:

```json
{
  "totalDeposits": 48320,
  "totalShares": 45200,
  "sharePrice": 1.069,
  "availableLiquidity": 31200,
  "lockedLiquidity": 17120,
  "apy": 0.124
}
```

### Reputation

```typescript
GET /api/v1/reputation/score/:walletAddress
GET /api/v1/reputation/profile/:walletAddress
GET /api/v1/reputation/history/:walletAddress
GET /api/v1/reputation/learner/:walletAddress/loans
GET /api/v1/reputation/:walletAddress/vouches
POST /api/v1/reputation/vouch/request
```

### Loans

```typescript
GET /api/v1/loans/my
GET /api/v1/loans/:id
```

### Vendors

```typescript
GET /api/v1/vendors
GET /api/v1/vendors/:id
GET /api/v1/vendors/dashboard
GET /api/v1/vendors/loans
GET /api/v1/vendors/payments
GET /api/v1/vendors/products
POST /api/v1/vendors/api-keys
DELETE /api/v1/vendors/api-keys/:id
```

### Vouching

```typescript
GET /api/v1/vouches/requests
GET /api/v1/vouches/my
POST /api/v1/vouches/submit
POST /api/v1/vouches/revoke/:id
```

## Error Handling

The API returns standard HTTP status codes:

```text
200 — Success
201 — Created
400 — Bad request (validation error)
401 — Unauthorized (invalid or expired token)
404 — Not found
500 — Internal server error
```

Error responses include a message:

```json
{
  "error": "Invalid wallet address",
  "message": "The provided wallet address is not a valid Stellar public key."
}
```

## Rate Limiting

API requests are rate-limited to 100 requests per minute per IP address. The response headers include:

```text
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1718000000
```
