## Summary

Closes #[issue number]

Add idempotency key and XDR hash deduplication to transaction submission to prevent duplicate submissions when the API crashes before confirming. The `transactionsService.submit()` method now auto-generates a UUID v4 idempotency key, hashes the signed XDR via SHA-256, checks localStorage for duplicates before calling the API, and stores completed records with a 24-hour TTL.

## This repo is for the React web app only

This app targets sponsors, vendors, and mentors.
It does NOT serve learners. Learner features
belong in StepFi-App.

Before submitting, confirm your changes belong here:

- [x] My changes are inside src/
- [x] I have NOT added Rust, Soroban, or
      contract code
- [x] I have NOT added React Native or
      Expo-specific code
- [x] I have NOT hardcoded hex color values
      (use Tailwind classes or constants/colors.ts)
- [x] All icons are from lucide-react only
- [x] No API calls made directly in page files
      (use services/ layer only)

## Type of change

- [x] Bug fix
- [ ] New page or component
- [x] Service layer addition
- [ ] Styling or responsive fix
- [ ] Accessibility improvement
- [ ] Performance improvement

## Testing

- [x] npm run build passes with zero errors
- [x] npm run lint passes with zero errors
- [x] Loading, error, and empty states handled
- [ ] Page tested on mobile viewport (375px)
- [ ] No console errors in browser

## Context files reviewed

- [x] context/architecture-context.md
- [x] context/code-standards.md
- [ ] context/progress-tracker.md updated

## Mandatory before requesting review

Running these must all exit 0:
- [x] npm run lint — 0 errors
- [x] npm test — 36 tests passed, 0 failures
- [x] npm run build — 0 errors

---

## What changed

### `src/services/idempotency.service.ts` (new)

Client-side idempotency layer backed by localStorage:

- **`generateKey()`** — Returns a UUID v4 via `crypto.randomUUID()`
- **`hashXdr(xdr)`** — SHA-256 hashes the XDR string via Web Crypto API for dedup lookups
- **`findExisting(xdrHash)`** — Looks up an XDR hash in localStorage, pruning expired records (> 24h) before lookup
- **`findByKey(idempotencyKey)`** — Looks up by idempotency key, pruning expired records before lookup
- **`store(record)`** — Persists a completed submission record with key, hash, tx hash, type, and ISO timestamp
- **`clear()`** — Removes all records (for testing/manual reset)

### `src/services/transactions.service.ts`

`submit()` now:

1. Auto-generates a UUID v4 idempotency key
2. Computes SHA-256 hash of the signed XDR
3. Checks localStorage for an existing record with the same XDR hash → returns cached result if found
4. Checks for duplicate idempotency key → returns cached result if found
5. Sends `{ xdr, type, idempotency_key }` to `POST /transactions/submit`
6. On success, stores the record in localStorage with 24h TTL

No existing callers need changes — `useTransaction`, `useOptimisticDeposit`, and all page-level deposit/withdraw flows get idempotency protection automatically.

### `src/types/index.ts`

Added `IdempotencyRecord` interface:

```ts
export interface IdempotencyRecord {
  idempotencyKey: string
  xdrHash: string
  transactionHash: string
  type: TransactionType
  createdAt: string
}
```

### Files changed

| File | Change |
|------|--------|
| `src/services/idempotency.service.ts` | New — idempotency key gen, XDR hash dedup, localStorage with 24h TTL |
| `src/services/transactions.service.ts` | Updated — auto-generates key, checks duplicates, passes to API |
| `src/types/index.ts` | Updated — added `IdempotencyRecord` type |
