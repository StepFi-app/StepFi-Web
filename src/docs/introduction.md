# Introduction

StepFi is an open-source Buy Now, Pay Later (BNPL) protocol built on **Stellar Soroban**. It connects three participant groups — sponsors, vendors, and learners — through smart contracts on the Stellar blockchain.

## Why StepFi?

Traditional banking excludes millions of aspiring developers in emerging markets. They lack credit history, collateral, or access to financial institutions. StepFi replaces banks with an on-chain reputation system.

Every on-time payment builds a learner's reputation score. That score unlocks lower interest rates and higher credit limits — all without a traditional credit check.

## Core Principles

- **No banks** — All operations run through open-source Soroban smart contracts
- **On-chain reputation** — Every repayment builds a verifiable reputation score
- **Transparent** — All contracts are open source with verifiable SHA-256 hashes
- **Permissionless** — Any sponsor can deposit, any vendor can register, any learner can apply

## Architecture Overview

```text
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Sponsors   │ ──▶ │  Liquidity Pool  │ ◀── │   Learners   │
│  (Deposit)   │     │   (USDC Loans)   │     │  (Borrow)    │
└──────────────┘     └──────────────────┘     └──────────────┘
                            │
                            ▼
                    ┌──────────────────┐     ┌──────────────┐
                    │  Vendor Registry │ ──▶ │   Vendors    │
                    │  (KYC + Products)│     │  (Get Paid)  │
                    └──────────────────┘     └──────────────┘
```

## The StepFi Contract Suite

| Contract | Wasm Hash | Purpose |
|---|---|---|
| Creditline | `d2b5c7e1...` | Issues and tracks BNPL loans |
| Reputation | `e3f4a5b6...` | Stores on-chain reputation scores |
| Liquidity Pool | `f5a6b7c8...` | Holds sponsor USDC deposits |
| Vendor Registry | `0b1c2d3e...` | Registers vendors and products |
| Parameters | `1c2d3e4f...` | Protocol-wide configuration |

## Technology Stack

- **Blockchain**: Stellar Soroban smart contracts (Rust)
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Wallet**: Freighter browser extension
- **API**: RESTful backend (Express + TypeScript)
