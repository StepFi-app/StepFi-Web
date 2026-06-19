# For Sponsors

Sponsors deposit USDC into the StepFi liquidity pool. Your capital funds verifiable learner loans and earns yield from interest payments.

## How It Works

1. **Deposit USDC** — Send USDC to the StepFi liquidity pool smart contract
2. **Capital is deployed** — Your deposit is pooled with other sponsors to fund approved learner loans
3. **Earn yield** — Interest paid by learners is distributed proportionally to all sponsors
4. **Withdraw anytime** — Redeem your pool shares for USDC plus earned yield

## Deposit Flow

```typescript
import { sponsorsService } from '../services/sponsors.service'

// 1. Get current pool info
const pool = await sponsorsService.getPoolInfo()

// 2. Submit a deposit transaction
const { hash } = await sponsorsService.submitDeposit(amount)

// 3. Verify on Stellar Expert
console.log(`View transaction: https://stellar.expert/explorer/testnet/tx/${hash}`)
```

## Pool Metrics

| Metric | Description |
|---|---|
| **Total Deposits** | Total USDC deposited into the pool |
| **Available Liquidity** | USDC not currently deployed in loans |
| **Locked Liquidity** | USDC currently funding active loans |
| **Share Price** | Current value of one pool share in USDC |
| **APY** | Annual percentage yield (variable) |

## Understanding Pool Shares

When you deposit, you receive pool shares. The share price increases as loans are repaid with interest. This means your shares are worth more over time.

```
Shares = Deposit Amount / Share Price
```

## Risk Considerations

- **Default risk** — Learners may fail to repay. Defaults reduce pool returns and may impact principal
- **Liquidity risk** — Large simultaneous withdrawals may be delayed if the pool lacks sufficient liquid capital
- **Smart contract risk** — Audited contracts reduce risk but no software is bug-free

## Frequently Asked Questions

### What is the minimum deposit?
There is no minimum. You can deposit any amount of USDC.

### How is yield calculated?
Yield is generated from learner loan interest. The APY displayed on the dashboard is calculated from historical and projected returns.

### Can I withdraw at any time?
Yes, withdrawals are processed from available liquidity on a first-come, first-served basis.
