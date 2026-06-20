# Smart Contracts

StepFi operates through five Soroban smart contracts deployed on Stellar Testnet. Each contract has a specific role in the protocol.

## Contract Addresses

### Creditline

Issues and tracks BNPL loans. Manages repayment schedules, interest accrual, and default detection.

```
CAQDHYG3TALPNXG466SZUMJEPOI7VYV732LPFF3GHE4ASPBCNMIQBS3X
```

### Reputation

Stores on-chain reputation scores for learners. Updated on repayments, defaults, and mentor vouches.

```
CC3BO57ZRJGA63QJBIBSOMI25Z3X2I5CYTARYRAUXUAILX6L3OWBL5SB
```

### Liquidity Pool

Holds sponsor USDC deposits. Funds approved loans and distributes yield to sponsors.

```
CACKE7ML2BTOAGQTAAW5NEARHCFX4PXXKGEO6GMU6NHFBVYQFZRJS2BT
```

### Vendor Registry

Registers approved vendors and their product catalogues. Enforces vendor KYC status on-chain.

```
CCZ6T6NYCDNI26VGTPXKKWQDR7JCIZZ24LCEG4MMYHZJAG6BPWIVAU2L
```

### Parameters

Protocol-wide configuration: interest rates, credit limits, repayment windows, and governance values.

```
CCAE72SKYX55C5L56DBEFIMFVXRUIJY6JYLBREHEWRFNOW7AX5NBIJ5B
```

## Verification

Each contract can be verified by comparing its SHA-256 hash against the published source:

```bash
# Clone the contracts repo
git clone https://github.com/StepFi-app/StepFi-Contracts.git
cd StepFi-Contracts

# Install Stellar CLI and build
cargo install --locked stellar-cli
stellar contract build

# Hash the compiled WASM
sha256sum target/wasm32-unknown-unknown/release/*.wasm

# Compare hashes against VERIFICATION.md
```

## Contract Interactions

```typescript
import { CONTRACT_IDS } from '../constants/config'
import { Contract } from '@stellar/stellar-sdk'

// Interact with the Creditline contract
const creditline = new Contract(CONTRACT_IDS.creditline)
const loan = await creditline.getLoan(loanId)
```

## Viewing on Stellar Expert

Each contract can be inspected on Stellar Expert:

```
https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>
```
