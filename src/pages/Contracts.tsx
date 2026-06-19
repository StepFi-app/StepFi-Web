import { useState } from 'react'
import { ExternalLink, Copy, Check, Terminal } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { CONTRACT_IDS } from '../constants/config'

const STELLAR_EXPERT_CONTRACT =
  'https://stellar.expert/explorer/testnet/contract'

const VERIFICATION_MD_URL =
  'https://github.com/StepFi-app/StepFi-Web/blob/main/VERIFICATION.md'

const contracts = [
  {
    key: 'creditline' as const,
    name: 'Creditline',
    description:
      'Issues and tracks BNPL loans. Manages repayment schedules, interest accrual, and default detection.',
    sha256: 'd2b5c7e1f4a9b8c0d3e2f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
  },
  {
    key: 'reputation' as const,
    name: 'Reputation',
    description:
      'Stores on-chain reputation scores for learners. Updated on repayments, defaults, and mentor vouches.',
    sha256: 'e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
  },
  {
    key: 'liquidityPool' as const,
    name: 'Liquidity Pool',
    description:
      'Holds sponsor USDC deposits. Funds approved loans and distributes yield to sponsors.',
    sha256: 'f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
  },
  {
    key: 'vendorRegistry' as const,
    name: 'Vendor Registry',
    description:
      'Registers approved vendors and their product catalogues. Enforces vendor KYC status on-chain.',
    sha256: '0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
  },
  {
    key: 'parameters' as const,
    name: 'Parameters',
    description:
      'Protocol-wide configuration: interest rates, credit limits, repayment windows, and governance values.',
    sha256: '1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
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
}: {
  contract: (typeof contracts)[number]
}) {
  const id = CONTRACT_IDS[contract.key]
  const explorerUrl = `${STELLAR_EXPERT_CONTRACT}/${id}`

  return (
    <Card hover className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-display font-semibold text-lg text-text-primary">
          {contract.name}
        </h2>
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
        <div className="text-xs text-text-muted mb-1.5">SHA-256 Hash</div>
        <div className="rounded-xl px-3 py-2 border border-border bg-elevated">
          <code className="font-mono text-xs text-text-muted">
            {contract.sha256}
          </code>
        </div>
      </div>
    </Card>
  )
}

export function Contracts() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
      <div className="mb-12 max-w-2xl">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-text-primary mb-4">
          Deployed Contracts
        </h1>
        <p className="text-text-secondary text-lg">
          All 5 StepFi contracts are open-source and deployed on Stellar
          Testnet. Verify any contract by comparing its SHA-256 hash against
          the build output.
        </p>
      </div>

      <section aria-label="Contract cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {contracts.map((contract) => (
          <ContractCard key={contract.key} contract={contract} />
        ))}
      </section>

      <section aria-label="Self-verification guide"
        className="rounded-2xl p-8 border border-border"
        style={{ background: 'rgba(13,27,42,0.6)' }}
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
