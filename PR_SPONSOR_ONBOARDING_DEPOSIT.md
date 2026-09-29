# PR: Fix Sponsor Onboarding — Wire StepDeposit to Real Deposit XDR Flow

## Summary

Closes #[issue number]

Replace the stub `StepDeposit` component in the sponsor onboarding wizard with a fully functional deposit flow. Sponsors completing the 4-step onboarding can now actually deposit USDC — amount input with $10 minimum validation, unsigned XDR fetched from the API, signed via Freighter, submitted on-chain, and a success state with a Stellar Expert link. On success, onboarding is marked complete and the sponsor is navigated to the dashboard.

## This repo is for the React web app only

This app targets sponsors, vendors, and mentors. It does NOT serve learners. Learner features belong in StepFi-App.

- [x] Changes are inside `src/`
- [x] No Rust, Soroban, or contract code
- [x] No React Native or Expo-specific code
- [x] No hardcoded hex color values (Tailwind classes only)
- [x] All icons from `lucide-react`
- [x] No API calls directly in page files (uses `services/` layer)

## Type of change

- [x] Bug fix
- [ ] New page or component
- [x] Service layer addition
- [ ] Styling or responsive fix
- [ ] Accessibility improvement
- [ ] Performance improvement

## Testing

- [x] `npm run build` — 0 errors
- [x] `npm run lint` — 0 errors
- [x] `npm test` — 36 tests passed, 0 failures
- [ ] Mobile viewport (375px) tested
- [ ] Browser console checked

## Context files reviewed

- [x] `context/architecture-context.md`
- [x] `context/code-standards.md`
- [ ] `context/progress-tracker.md` updated

---

## What changed

**`src/pages/SponsorOnboarding.tsx`** — Replaced the `StepDeposit` stub (lines 267–316) with a real deposit flow:

| Feature | Implementation |
|---------|---------------|
| **Amount input** | Numeric input with `$10` minimum validation, inline error messaging (`aria-invalid`, `role="alert"`) |
| **XDR fetch** | `sponsorsService.deposit(amount)` returns `UnsignedTransaction<DepositPreview>` |
| **Freighter signing** | Delegated to the existing `useTransaction` hook which calls `@stellar/freighter-api`'s `signTransaction` |
| **Submission** | `transactionsService.submit(signedXdr, 'deposit')` posts to `POST /transactions/submit` |
| **Success state** | Card showing deposit amount, transaction hash, and a clickable Stellar Expert link |
| **Onboarding completion** | `onComplete` fires after deposit success → sets `onboardingComplete: true` → navigates to `/sponsors` |
| **Error state** | Inline error card using the same pattern as the Sponsors dashboard |
| **Disconnected state** | "Connect Freighter Wallet" button with download link + GrantFox fallback |

All patterns mirror the existing deposit flow in `src/pages/Sponsors.tsx` — `useTransaction`, `useToast`, `invalidatesubtree.pool`, and the success card layout.

### Acceptance criteria met

- [x] Deposit amount input with $10 minimum validation
- [x] Unsigned XDR fetched from API
- [x] XDR signed via Freighter
- [x] Signed XDR submitted
- [x] Success state shown with Stellar Expert link
- [x] Onboarding marked complete after successful deposit

### Files changed

| File | Change |
|------|--------|
| `src/pages/SponsorOnboarding.tsx` | Replaced `StepDeposit` stub with full deposit flow (+ 5 new imports) |
