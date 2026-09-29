// Runtime configuration. Every environment-specific value is read from a
// `VITE_*` build-time env var with a testnet-friendly default, so the app runs
// out of the box locally yet can be pointed at staging/mainnet purely through
// environment — no source edits. See `.env.example` for the full list.

export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || 'https://stepfi-api.onrender.com/api/v1'

export const STELLAR_NETWORK =
  import.meta.env?.VITE_STELLAR_NETWORK || 'TESTNET'

export const SOROBAN_RPC_URL =
  import.meta.env?.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'

export const CONTRACT_IDS = {
  creditline:
    import.meta.env?.VITE_CONTRACT_CREDITLINE ||
    'CAQDHYG3TALPNXG466SZUMJEPOI7VYV732LPFF3GHE4ASPBCNMIQBS3X',
  reputation:
    import.meta.env?.VITE_CONTRACT_REPUTATION ||
    'CC3BO57ZRJGA63QJBIBSOMI25Z3X2I5CYTARYRAUXUAILX6L3OWBL5SB',
  liquidityPool:
    import.meta.env?.VITE_CONTRACT_LIQUIDITY_POOL ||
    'CACKE7ML2BTOAGQTAAW5NEARHCFX4PXXKGEO6GMU6NHFBVYQFZRJS2BT',
  vendorRegistry:
    import.meta.env?.VITE_CONTRACT_VENDOR_REGISTRY ||
    'CCZ6T6NYCDNI26VGTPXKKWQDR7JCIZZ24LCEG4MMYHZJAG6BPWIVAU2L',
  parameters:
    import.meta.env?.VITE_CONTRACT_PARAMETERS ||
    'CCAE72SKYX55C5L56DBEFIMFVXRUIJY6JYLBREHEWRFNOW7AX5NBIJ5B',
}

// Public program links — fixed StepFi properties, not environment-specific.
export const GRANTFOX_URL =
  'https://contribute.grantfox.xyz/org/StepFi-app'

export const GRANTFOX_JOIN_URL =
  'https://contribute.grantfox.xyz/join?ref=EmeditWeb'
