
# StepFi-Web

[![CI](https://github.com/StepFi-app/StepFi-Web/actions/workflows/ci.yml/badge.svg)](https://github.com/StepFi-app/StepFi-Web/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

The web application for the StepFi protocol. Built for sponsors, vendors, and mentors, the three participants who keep the StepFi lending pool running on Stellar.

**Live:** https://stepfi-web.netlify.app

---

## What this app is for

StepFi is an open-source Buy Now Pay Later protocol on Stellar. Learners use a separate mobile app (StepFi-App) to apply for credit and repay installments. StepFi-Web is the desktop-facing side of the same protocol, built for the people who fund it, list products on it, and vouch for the learners using it.

### Sponsors

Sponsors deposit USDC into the StepFi liquidity pool. That capital funds approved learner loans. As learners repay with interest, the pool grows and sponsor shares increase in value. Sponsors can withdraw their position plus earned yield at any time.

From the web app, a sponsor can:

- View live pool stats:
  - Total deposits
  - Available liquidity
  - Locked liquidity
  - Current APY
- Deposit USDC and receive pool shares
- Track position value and earned yield over time
- See which active loans their capital is backing
- Withdraw shares for USDC plus yield

### Vendors

Vendors are the schools, bootcamps, electronics retailers, and tool providers that learners buy from. When a loan is approved, the vendor gets paid upfront in full. The learner repays StepFi in installments, not the vendor directly.

From the web app, a vendor can:

- Register their business and get approved into the protocol
- List products and services available for financing
- Track loans tied to their catalog
- See payment history and total volume received
- Generate API keys for programmatic integration

### Mentors

Mentors are senior developers with strong on-chain reputation. A mentor can vouch for a learner they trust, which boosts that learner's reputation score and unlocks lower interest rates and higher credit limits. If the learner defaults, the mentor's own reputation takes a hit, so vouching means something.

From the web app, a mentor can:

- Review vouch requests from learners
- View a learner's public profile and reputation history before vouching
- Submit a vouch with their wallet signature
- Track active vouches and their expiry
- Revoke a vouch if needed

---

## How this fits into the StepFi ecosystem

StepFi is split across multiple repositories that together form one protocol:

| Repo | Purpose | Stack |
|--------|---------|--------|
| [StepFi-Contracts](https://github.com/StepFi-app/StepFi-Contracts) | On-chain logic: credit line, reputation, liquidity pool, vendor registry, parameters | Rust, Soroban |
| [StepFi-API](https://github.com/StepFi-app/StepFi-API) | Off-chain orchestration: auth, loan building, indexing, background jobs | NestJS, Fastify, Supabase |
| [StepFi-App](https://github.com/StepFi-app/StepFi-App) | Mobile app for learners: apply for credit, repay installments, build reputation | React Native, Expo |
| **StepFi-Web** | This repository. Web app for sponsors, vendors, and mentors | Vite, React, TypeScript |
| [StepFi-Docs](https://github.com/StepFi-app/StepFi-Docs) | Full protocol documentation | docs.page |

All five repositories talk to the same live API and the same five Soroban contracts deployed on Stellar testnet.

A deposit made here shows up in the mobile app's loan funding. A vouch submitted here affects a learner's reputation score wherever it's checked.

---

## Live Deployments

| Resource | Link |
|-----------|------|
| StepFi-Web | https://stepfi-web.netlify.app |
| Landing Page | https://stepfi.vercel.app |
| API | https://stepfi-api.onrender.com/api/v1 |
| API Docs (Swagger) | https://stepfi-api.onrender.com/api/v1/docs |
| Full Documentation | https://docs.page/StepFi-app/StepFi-Docs |
| Interactive Demo | https://stepfi.vercel.app/demo |
| API Playground | https://stepfi.vercel.app/playground |

---

## Deployed Contracts (Stellar Testnet)

| Contract | Contract ID |
|------------|------------|
| Creditline | `CAQDHYG3TALPNXG466SZUMJEPOI7VYV732LPFF3GHE4ASPBCNMIQBS3X` |
| Reputation | `CC3BO57ZRJGA63QJBIBSOMI25Z3X2I5CYTARYRAUXUAILX6L3OWBL5SB` |
| Liquidity Pool | `CACKE7ML2BTOAGQTAAW5NEARHCFX4PXXKGEO6GMU6NHFBVYQFZRJS2BT` |
| Vendor Registry | `CCZ6T6NYCDNI26VGTPXKKWQDR7JCIZZ24LCEG4MMYHZJAG6BPWIVAU2L` |
| Parameters | `CCAE72SKYX55C5L56DBEFIMFVXRUIJY6JYLBREHEWRFNOW7AX5NBIJ5B` |

Verified via SHA256 hash comparison.

Full release with WASM artifacts:

- https://github.com/StepFi-app/StepFi-Contracts/releases/tag/v1.0.0

---

## Tech Stack

- Vite
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- Freighter API
- Stellar SDK

---

## Getting Started

### Install dependencies

```bash
npm install
````

### Start development server

```bash
npm run dev
```

The app runs against the live testnet API by default.

No local backend setup is required to start contributing to the frontend.

---

## Contributing

StepFi-Web is open source and welcomes contributors of all experience levels.

### Before you start

1. Read the `context/` folder before writing any code.
2. Browse open issues labeled by difficulty:

   * good first issue
   * medium
   * hard
   * core
3. Fork the repository.
4. Create a branch.
5. Build your feature.
6. Open a PR referencing the issue number.

### Earn rewards for contributions

StepFi is live on Grantfox, an open-source collaboration hub in the Stellar ecosystem.

Every merged PR earns transparent Stellar rewards.

No application gate. Just build and ship.

#### Get started on Grantfox

Create an account:

https://contribute.grantfox.xyz/join?ref=EmeditWeb

Browse StepFi issues:

https://contribute.grantfox.xyz/org/StepFi-app

---

## License

MIT
