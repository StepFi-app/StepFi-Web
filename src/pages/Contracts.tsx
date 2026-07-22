import { useState, useEffect } from 'react'
import {
  ExternalLink,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { CONTRACT_IDS } from '../constants/config'
import { sorobanService } from '../services/soroban.service'
import { poolService } from '../services/pool.service'
import type {
  ContractWasmInfo,
  VerificationReconciliation,
} from '../types'

const STELLAR_EXPERT_CONTRACT =
  'https://stellar.expert/explorer/testnet/contract'

const VERIFICATION_MD_URL =
  'https://github.com/StepFi-app/StepFi-Web/blob/main/VERIFICATION.md'

const contractDefinitions = [
  {
    key: 'creditline' as const,
    name: 'Creditline',
    description:
      'Issues and tracks BNPL loans. Manages repayment schedules, interest accrual, and default detection.',
  },
  {
    key: 'reputation' as const,
    name: 'Reputation',
    description:
      'Stores on-chain reputation scores for learners. Updated on repayments, defaults, and mentor vouches.',
  },
  {
    key: 'liquidityPool' as const,
    name: 'Liquidity Pool',
    description:
      'Holds sponsor USDC deposits. Funds approved loans and distributes yield to sponsors.',
  },
  {
    key: 'vendorRegistry' as const,
    name: 'Vendor Registry',
    description:
      'Registers approved vendors and their product catalogues. Enforces vendor KYC status on-chain.',
  },
  {
    key: 'parameters' as const,
    name: 'Parameters',
    description:
      'Protocol-wide configuration: interest rates, credit limits, repayment windows, and governance values.',
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-colors"
      aria-label={copied ? 'Contract ID copied' : 'Copy contract ID'}
    >
      {copied ? <Check size={14} className="text-brand" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
    </button>
  )
}

function ContractCard({
  contract,
  wasmInfo,
  loading,
}: {
  contract: (typeof contractDefinitions)[number]
  wasmInfo?: ContractWasmInfo
  loading: boolean
}) {
  const id = CONTRACT_IDS[contract.key]
  const explorerUrl = `${STELLAR_EXPERT_CONTRACT}/${id}`

  return (
    <Card hover className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-display font-semibold text-lg text-text-primary">
            {contract.name}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            {loading ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-surface text-text-muted border border-border">
                <Spinner size={14} /> Querying Soroban RPC...
              </span>
            ) : wasmInfo?.status === 'success' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20">
                <ShieldCheck size={12} aria-hidden="true" /> Verified On-Chain
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle size={12} aria-hidden="true" /> RPC Read Degraded
              </span>
            )}
          </div>
        </div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Stellar Expert"
          className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-colors"
        >
          <ExternalLink size={16} />
        </a>
      </div>

      <p className="text-text-secondary text-sm leading-relaxed">
        {contract.description}
      </p>

      <div>
        <div className="text-xs text-text-muted mb-1.5">Contract ID</div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 border border-border bg-elevated">
          <code className="font-mono text-xs text-text-secondary break-all flex-1">
            {id}
          </code>
          <CopyButton text={id} />
        </div>
      </div>

      <div>
        <div className="text-xs text-text-muted mb-1.5 flex items-center justify-between">
          <span>Real Deployed WASM Hash (SHA-256)</span>
          {wasmInfo?.status === 'success' && (
            <span className="text-brand text-[10px] uppercase font-semibold tracking-wider">Live Read</span>
          )}
        </div>
        <div className="rounded-xl px-3 py-2 border border-border bg-elevated">
          {loading ? (
            <div className="flex items-center gap-2 py-1 text-text-muted text-xs font-mono">
              <Spinner size={14} /> Reading WASM bytecode from chain...
            </div>
          ) : wasmInfo?.status === 'success' && wasmInfo.wasmHash ? (
            <code className="font-mono text-xs text-brand break-all block">
              {wasmInfo.wasmHash}
            </code>
          ) : (
            <div className="text-xs text-amber-400 font-mono flex items-center gap-1.5">
              <AlertTriangle size={12} />
              {wasmInfo?.error || 'Unable to fetch WASM hash from Soroban RPC'}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function ReconciliationSection({
  reconciliation,
  loading,
  onRetry,
}: {
  reconciliation: VerificationReconciliation | null
  loading: boolean
  onRetry: () => void
}) {
  return (
    <section aria-label="On-chain state reconciliation" className="rounded-xl p-6 border border-border bg-surface mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-semibold text-xl text-text-primary flex items-center gap-2">
            On-Chain vs API Reconciliation
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Trust-minimized verification comparing API-served pool values directly against Soroban smart contract state.
          </p>
        </div>
        <button
          onClick={onRetry}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-border text-text-secondary hover:text-text-primary hover:border-brand/40 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Re-query On-Chain
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-text-muted flex flex-col items-center gap-2">
          <Spinner size={24} />
          <p className="text-sm">Querying Soroban RPC getLedgerEntries & contract simulation state...</p>
        </div>
      ) : reconciliation ? (
        <div>
          {reconciliation.hasAnyMismatch ? (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-start gap-3">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Data Mismatch Detected</h3>
                <p className="text-xs text-amber-400/90 mt-1">
                  API-reported pool metrics do not match direct Soroban contract state. Please exercise caution.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl bg-brand/10 border border-brand/30 text-brand flex items-center gap-3">
              <CheckCircle2 size={20} className="shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">100% On-Chain Reconciled</h3>
                <p className="text-xs text-brand/90 mt-0.5">
                  All API-reported values match live Soroban smart contract ledger state.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Liquidity',
                apiVal: reconciliation.apiStats ? `$${reconciliation.apiStats.totalLiquidity.toLocaleString()}` : 'N/A',
                sorobanVal: reconciliation.sorobanStats ? `$${reconciliation.sorobanStats.totalLiquidity.toLocaleString()}` : 'N/A',
                isMatch: reconciliation.totalLiquidityMatch,
              },
              {
                label: 'Available Liquidity',
                apiVal: reconciliation.apiStats ? `$${reconciliation.apiStats.availableLiquidity.toLocaleString()}` : 'N/A',
                sorobanVal: reconciliation.sorobanStats ? `$${reconciliation.sorobanStats.availableLiquidity.toLocaleString()}` : 'N/A',
                isMatch: reconciliation.availableLiquidityMatch,
              },
              {
                label: 'Locked Liquidity',
                apiVal: reconciliation.apiStats ? `$${reconciliation.apiStats.lockedLiquidity.toLocaleString()}` : 'N/A',
                sorobanVal: reconciliation.sorobanStats ? `$${reconciliation.sorobanStats.lockedLiquidity.toLocaleString()}` : 'N/A',
                isMatch: reconciliation.lockedLiquidityMatch,
              },
              {
                label: 'Share Price',
                apiVal: reconciliation.apiStats ? `$${reconciliation.apiStats.sharePrice.toFixed(4)}` : 'N/A',
                sorobanVal: reconciliation.sorobanStats ? `$${reconciliation.sorobanStats.sharePrice.toFixed(4)}` : 'N/A',
                isMatch: reconciliation.sharePriceMatch,
              },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl border border-border bg-elevated">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-muted">{stat.label}</span>
                  {stat.isMatch ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand bg-brand/10 px-1.5 py-0.5 rounded">
                      <CheckCircle2 size={10} /> Match
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      <XCircle size={10} /> Mismatch
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-secondary">
                  API: <span className="font-mono text-text-primary font-medium">{stat.apiVal}</span>
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  On-Chain: <span className="font-mono text-brand font-medium">{stat.sorobanVal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-text-muted text-sm">
          No reconciliation data available. Click &quot;Re-query On-Chain&quot; to fetch live state.
        </div>
      )}
    </section>
  )
}

export function Contracts() {
  const [wasmHashes, setWasmHashes] = useState<Record<string, ContractWasmInfo>>({})
  const [reconciliation, setReconciliation] = useState<VerificationReconciliation | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  async function loadOnChainData() {
    setLoading(true)
    setError(null)
    try {
      const hashes = await sorobanService.getAllContractWasmHashes()
      setWasmHashes(hashes)

      const [apiPoolInfo, sorobanPoolStats] = await Promise.all([
        poolService.getPoolInfo().catch(() => null),
        sorobanService.getPoolStats().catch(() => null),
      ])

      const recon = sorobanService.reconcilePoolStats(apiPoolInfo, sorobanPoolStats)
      setReconciliation(recon)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to query Soroban RPC'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    async function fetchData() {
      try {
        const hashes = await sorobanService.getAllContractWasmHashes()
        if (ignore) return
        setWasmHashes(hashes)

        const [apiPoolInfo, sorobanPoolStats] = await Promise.all([
          poolService.getPoolInfo().catch(() => null),
          sorobanService.getPoolStats().catch(() => null),
        ])
        if (ignore) return
        const recon = sorobanService.reconcilePoolStats(apiPoolInfo, sorobanPoolStats)
        setReconciliation(recon)
      } catch (err) {
        if (ignore) return
        const msg = err instanceof Error ? err.message : 'Failed to query Soroban RPC'
        setError(msg)
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    fetchData()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display font-semibold text-2xl text-text-primary mb-4">
          Deployed Contracts
        </h1>
        <p className="text-text-secondary text-lg">
          All 5 StepFi contracts are open-source and deployed on Stellar
          Testnet. Verify any contract by querying its real deployed SHA-256 WASM bytecode hash directly from Soroban RPC.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="shrink-0" />
            <div className="text-sm">
              <strong>Soroban RPC Warning:</strong> {error}
            </div>
          </div>
          <button
            onClick={loadOnChainData}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-medium transition-colors"
          >
            Retry Read
          </button>
        </div>
      )}

      <section aria-label="Contract cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {contractDefinitions.map((contract) => (
          <ContractCard
            key={contract.key}
            contract={contract}
            wasmInfo={wasmHashes[contract.key]}
            loading={loading}
          />
        ))}
      </section>

      <ReconciliationSection
        reconciliation={reconciliation}
        loading={loading}
        onRetry={loadOnChainData}
      />

      <section
        aria-label="Self-verification guide"
        className="rounded-xl p-6 border border-border bg-surface"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand/10 border border-brand/20">
            <Terminal size={20} className="text-brand" aria-hidden="true" />
          </div>
          <h2 className="font-display font-semibold text-xl text-text-primary">
            Self-Verification Guide
          </h2>
        </div>

        <p className="text-text-secondary text-sm mb-6">
          Clone the contracts repo, build locally, and compare the WASM hash
          to the hash in{' '}
          <a
            href={VERIFICATION_MD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline underline-offset-2 decoration-brand/60 hover:decoration-brand"
          >
            VERIFICATION.md
          </a>
          . A matching hash confirms the on-chain bytecode was compiled from
          the published source.
        </p>

        <ol className="space-y-5">
          {[
            {
              step: '1. Clone the contracts repo',
              code: 'git clone https://github.com/StepFi-app/StepFi-Contracts.git\ncd StepFi-Contracts',
            },
            {
              step: '2. Install Stellar CLI and build',
              code: 'cargo install --locked stellar-cli\nstellar contract build',
            },
            {
              step: '3. Hash the compiled WASM',
              code: 'sha256sum target/wasm32-unknown-unknown/release/*.wasm',
            },
            {
              step: '4. Compare against VERIFICATION.md',
              code: '# Hashes must match exactly.\n# Any difference means the on-chain bytecode\n# was not built from the published source.',
            },
          ].map(({ step, code }) => (
            <li key={step}>
              <div className="text-sm font-medium text-text-primary mb-2">
                {step}
              </div>
              <pre className="rounded-xl px-4 py-3 border border-border bg-elevated overflow-x-auto">
                <code className="font-mono text-xs text-text-secondary whitespace-pre">
                  {code}
                </code>
              </pre>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <a
            href={VERIFICATION_MD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 transition-colors"
          >
            View VERIFICATION.md <ExternalLink size={14} />
          </a>
          <a
            href="https://github.com/StepFi-app/StepFi-Contracts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-text-muted border border-border hover:text-brand hover:border-brand/30 transition-colors"
          >
            Browse Source Code <ExternalLink size={14} />
          </a>
        </div>
      </section>
    </div>
  )
}
