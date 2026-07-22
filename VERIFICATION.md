# Contract Verification

This document provides the SHA256 hashes of the compiled Soroban smart contracts for the StepFi protocol. You can use these hashes to verify that the on-chain bytecode matches the source code published in the [StepFi-Contracts](https://github.com/StepFi-app/StepFi-Contracts) repository.

The hashes below are the **on-chain wasm hashes** of the live contracts
(deployer `GCOYDYSEHRCFWGXUCMPSQ3ODEY2LGMBSVKKCOFH4NRIK4DEEDSETH7BF`), last
verified against the ledger and against a reproducible build of `main` on
**2026-07-17**.

## Contract Hashes (Stellar Testnet)

| Contract | Contract ID | SHA256 Hash (on-chain wasm) |
| :--- | :--- | :--- |
| **Creditline** | `CAQDHYG3TALPNXG466SZUMJEPOI7VYV732LPFF3GHE4ASPBCNMIQBS3X` | `392ad2562e8836a2836695bb4ed32973bde100b243b5f695ddf2698464541c9e` |
| **Reputation** | `CC3BO57ZRJGA63QJBIBSOMI25Z3X2I5CYTARYRAUXUAILX6L3OWBL5SB` | `548ad3c1e0bca85a7adccb883879ed02e6bf93970d8af06ac8506d487a115da4` |
| **Liquidity Pool** | `CACKE7ML2BTOAGQTAAW5NEARHCFX4PXXKGEO6GMU6NHFBVYQFZRJS2BT` | `5cccbfb7dd2a723110fb299c84636b25d7a437c07092a943b5e4d76f141adf38` |
| **Vendor Registry** | `CCZ6T6NYCDNI26VGTPXKKWQDR7JCIZZ24LCEG4MMYHZJAG6BPWIVAU2L` | `b973d07391e2cd4834370ba596873a3cd34dc7e39c7f059eaca321f597d9ada2` |
| **Parameters** | `CCAE72SKYX55C5L56DBEFIMFVXRUIJY6JYLBREHEWRFNOW7AX5NBIJ5B` | `25cd88d4a48b706a59d7eae5c45a592b844048dc3428c24f3a8c7a420057b785` |

## How to Verify

### Method A — against the live chain (authoritative, toolchain-independent)

This downloads the exact bytecode currently running on-chain and hashes it.

```bash
# Requires the Stellar CLI: https://github.com/stellar/stellar-cli
for ID in \
  CAQDHYG3TALPNXG466SZUMJEPOI7VYV732LPFF3GHE4ASPBCNMIQBS3X \
  CC3BO57ZRJGA63QJBIBSOMI25Z3X2I5CYTARYRAUXUAILX6L3OWBL5SB \
  CACKE7ML2BTOAGQTAAW5NEARHCFX4PXXKGEO6GMU6NHFBVYQFZRJS2BT \
  CCZ6T6NYCDNI26VGTPXKKWQDR7JCIZZ24LCEG4MMYHZJAG6BPWIVAU2L \
  CCAE72SKYX55C5L56DBEFIMFVXRUIJY6JYLBREHEWRFNOW7AX5NBIJ5B ; do
  stellar contract fetch --network testnet --id "$ID" --out-file "$ID.wasm"
  sha256sum "$ID.wasm"
done
```

Compare each hash with the table above.

### Method B — reproducible build from source

```bash
git clone https://github.com/StepFi-app/StepFi-Contracts.git
cd StepFi-Contracts
stellar contract build
stellar contract optimize --wasm target/**/release/<contract>.wasm
sha256sum target/**/release/*.optimized.wasm
```

The **deployed bytecode is the optimized wasm** (`.optimized.wasm`), not the raw
build output. If Method B diverges due to toolchain drift, Method A is
authoritative. See the canonical copy in
[StepFi-Contracts/VERIFICATION.md](https://github.com/StepFi-app/StepFi-Contracts/blob/main/VERIFICATION.md).
