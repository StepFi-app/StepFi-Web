## Summary

Closes #[issue number]

Replace the stub `StepDeposit` component in the sponsor onboarding wizard with a fully functional deposit flow. Sponsors completing the 4-step onboarding can now actually deposit USDC — amount input with $10 minimum validation, unsigned XDR fetched from the API, signed via Freighter, submitted on-chain, and a success state with a Stellar Expert link. On success, onboarding is marked complete and the sponsor is navigated to the dashboard.

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

**`src/pages/SponsorOnboarding.tsx`** — Replaced the `StepDeposit` stub with a real deposit flow:

- **Amount input** with `$10` minimum validation and inline error messaging (`aria-invalid`, `role="alert"`)
- **Unsigned XDR** fetched via `sponsorsService.deposit(amount)`
- **Freighter signing** handled by the existing `useTransaction` hook (which calls `@stellar/freighter-api`'s `signTransaction`)
- **Signed XDR submission** via `transactionsService.submit(signedXdr, 'deposit')`
- **Success state** showing deposit amount, transaction hash, and a Stellar Expert link
- **Onboarding completion** — `onComplete` fires after a successful deposit, setting `onboardingComplete: true` and navigating to `/sponsors`
- **Error state** displayed inline using the existing error card pattern from the Sponsors dashboard
- **Disconnected state** still shows "Connect Freighter Wallet" with Freighter download link and GrantFox fallback

All patterns mirror the existing deposit flow in `src/pages/Sponsors.tsx` exactly — `useTransaction`, `useToast`, `invalidatesubtree.pool`, and the success card layout.

### Files changed

| File | Change |
|------|--------|
| `src/pages/SponsorOnboarding.tsx` | Replaced `StepDeposit` stub with full deposit flow (+ imports) |
