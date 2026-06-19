import 'highlight.js/styles/atom-one-dark.css'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { Search, Copy, Check, ExternalLink, Menu, ChevronRight, FileText, Hash } from 'lucide-react'
import { DocSidebar } from '../components/docs/DocSidebar'
import { DOC_SECTIONS } from '../components/docs/DocSections'
import { DocContent } from '../components/docs/DocContent'
import { Card } from '../components/ui/Card'
import { CONTRACT_IDS } from '../constants/config'

const STELLAR_EXPERT_CONTRACT = 'https://stellar.expert/explorer/testnet/contract'

import introContent from '../docs/introduction.md?raw'
import gettingStartedContent from '../docs/getting-started.md?raw'
import forSponsorsContent from '../docs/for-sponsors.md?raw'
import forVendorsContent from '../docs/for-vendors.md?raw'
import forMentorsContent from '../docs/for-mentors.md?raw'
import smartContractsContent from '../docs/smart-contracts.md?raw'
import apiReferenceContent from '../docs/api-reference.md?raw'

const DOC_CONTENT: Record<string, string> = {
  introduction: introContent,
  'getting-started': gettingStartedContent,
  'for-sponsors': forSponsorsContent,
  'for-vendors': forVendorsContent,
  'for-mentors': forMentorsContent,
  'smart-contracts': smartContractsContent,
  'api-reference': apiReferenceContent,
}

interface ContractInfo {
  name: string
  id: string
  key: keyof typeof CONTRACT_IDS
}

const CONTRACTS: ContractInfo[] = [
  { name: 'Creditline', id: CONTRACT_IDS.creditline, key: 'creditline' },
  { name: 'Reputation', id: CONTRACT_IDS.reputation, key: 'reputation' },
  { name: 'Liquidity Pool', id: CONTRACT_IDS.liquidityPool, key: 'liquidityPool' },
  { name: 'Vendor Registry', id: CONTRACT_IDS.vendorRegistry, key: 'vendorRegistry' },
  { name: 'Parameters', id: CONTRACT_IDS.parameters, key: 'parameters' },
]

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1] : ''
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-colors"
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
    >
      {copied ? <Check size={14} className="text-brand" /> : <Copy size={14} />}
    </button>
  )
}

const QUICK_LINKS = [
  { label: 'Smart Contracts', slug: 'smart-contracts' },
  { label: 'API Reference', slug: 'api-reference' },
  { label: 'Getting Started', slug: 'getting-started' },
  { label: 'For Sponsors', slug: 'for-sponsors' },
  { label: 'For Vendors', slug: 'for-vendors' },
  { label: 'For Mentors', slug: 'for-mentors' },
]

export function Docs() {
  const [activeSlug, setActiveSlug] = useState('introduction')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSidebar, setMobileSidebar] = useState(false)

  const loadContent = useCallback((slug: string) => {
    return DOC_CONTENT[slug] || ''
  }, [])

  const activeContent = useMemo(() => loadContent(activeSlug), [activeSlug, loadContent])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.toLowerCase()

    const results: { slug: string; title: string; snippet: string }[] = []

    for (const section of DOC_SECTIONS) {
      const content = loadContent(section.slug)
      if (!content) continue

      const title = extractTitle(content)
      const body = content.replace(/^#\s.+$/m, '').toLowerCase()

      if (title.toLowerCase().includes(q) || body.includes(q)) {
        const matchIndex = body.indexOf(q)
        const start = Math.max(0, matchIndex - 40)
        const end = Math.min(body.length, matchIndex + q.length + 60)
        const snippet = body.slice(start, end).replace(/\n/g, ' ')
        results.push({ slug: section.slug, title, snippet })
      }
    }

    return results
  }, [searchQuery, loadContent])

  useEffect(() => {
    if (activeSlug) {
      const hash = activeSlug === 'introduction' ? '' : `#${activeSlug}`
      window.history.replaceState(null, '', `/docs${hash ? `?section=${activeSlug}` : ''}`)
    }
  }, [activeSlug])

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <DocSidebar
        activeSlug={activeSlug}
        onNavigate={setActiveSlug}
        mobileOpen={mobileSidebar}
        onMobileClose={() => setMobileSidebar(false)}
      />

      <div className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setMobileSidebar(true)}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              aria-label="Open documentation sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-display font-bold text-2xl text-text-primary">
              Documentation
            </h1>
          </div>

          <div className="relative mb-8">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
              aria-label="Search documentation"
            />
          </div>

          {searchQuery.trim() && searchResults ? (
            <section aria-label="Search results">
              {searchResults.length === 0 ? (
                <div className="text-center py-16">
                  <FileText size={40} className="mx-auto text-text-muted mb-4" aria-hidden="true" />
                  <p className="text-text-secondary">No results found for <span className="text-text-primary font-medium">&quot;{searchQuery}&quot;</span></p>
                  <p className="text-text-muted text-sm mt-2">Try a different search term.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-text-muted text-sm mb-4">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                  </p>
                  {searchResults.map((result) => (
                    <button
                      key={result.slug}
                      onClick={() => {
                        setActiveSlug(result.slug)
                        setSearchQuery('')
                      }}
                      className="w-full text-left p-4 rounded-xl border border-border bg-surface hover:border-brand/30 transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-semibold text-text-primary">{result.title}</span>
                        <ChevronRight size={14} className="text-text-muted group-hover:text-brand transition-colors" />
                      </div>
                      <p className="text-text-muted text-sm line-clamp-2">
                        ...{result.snippet}...
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-8">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.slug}
                    onClick={() => setActiveSlug(link.slug)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-text-secondary hover:text-brand hover:border-brand/30 transition-colors"
                  >
                    {link.label}
                    <ChevronRight size={12} />
                  </button>
                ))}
              </div>

              {activeSlug === 'smart-contracts' && (
                <section aria-label="Contract addresses" className="mb-10">
                  <Card className="border-brand/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Hash size={18} className="text-brand" />
                      <h2 className="font-display font-bold text-lg text-text-primary">
                        Contract Addresses
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {CONTRACTS.map((contract) => (
                        <div key={contract.key} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-text-primary text-sm font-medium mb-0.5">{contract.name}</p>
                            <code className="font-mono text-xs text-text-secondary break-all">{contract.id}</code>
                          </div>
                          <CopyButton text={contract.id} label={`${contract.name} contract ID`} />
                          <a
                            href={`${STELLAR_EXPERT_CONTRACT}/${contract.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-colors"
                            aria-label={`View ${contract.name} on Stellar Expert`}
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>
              )}

              <article className="prose-custom">
                <DocContent content={activeContent} />
              </article>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
