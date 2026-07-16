# Progress Tracker — StepFi-Web

Format: date, commit hash, what changed, why.
Update this file in every PR that changes functionality (not needed for
pure chore/docs commits). Direct pushes to main must also be logged here.

---

## 2026-07-16

- Roles are now wallet-bound and server-side: role selection calls
  `POST /users/me/role` (permanent, 409 if already set), reconnect syncs
  the role from `GET /users/me`, and the JWT is refreshed so it carries
  the role claim (parallel session)
- Banned hardcoded hex colors in .tsx via ESLint `no-restricted-syntax`;
  replaced all 32 existing hex values with tokens from
  `constants/colors.ts` (new tokens: amber, amberDark, violet,
  blueLight, textFaint, logo palette)
- Added role-based access control: sponsors, vendors, and mentors select
  a role after wallet connect and are gated from other personas' pages
  via `RoleGuard` (commit 853e48d)
- Fixed role selection screen not appearing on first wallet connection —
  `connectFreighter()` never navigated after success; now routes to
  `/role-select` (first time) or the role-specific dashboard (returning
  users) (commit 2d4493e)
- Fixed 401 handling: the axios interceptor force-redirected to home on
  any 401 without a refresh token, tearing down pages (e.g. sponsor
  deposit) before their error toasts could render. Now only redirects
  users who were never authenticated; expired sessions attempt
  `POST /auth/refresh` first (commit 2d4493e)
- Pool overview now shows locked vs available liquidity breakdown from
  the updated API endpoint (commit 624b02b)
- Removed Contribute section from home page (commit 18203c8)
- Migrated vitest config, hardened api interceptor tests (commit 4723264)
- Typography/spacing density pass on dashboard (commit 833ce98)

## 2026-07-02

- Added Vitest setup and initial test suite for components, stores, and
  services (commit a82d6ea)
- Added netlify.toml with SPA redirects and security headers; redeployed
  (commit f486242)
- Repo hygiene: PR template + CODEOWNERS (260e5e7), issue template with
  test requirements (5c42b81)

## 2026-06-30

- Vendor registration and profile pages (#53, commit d6a814c)

## 2026-06-22

- Light/dark theme toggle with localStorage persistence (#51,
  commit 090be74)

---

> Note (2026-07-16): tracker created retroactively — this repo had no
> progress tracker before this date. Earlier work is in git history only.
