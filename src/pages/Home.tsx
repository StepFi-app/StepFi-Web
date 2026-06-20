import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  GraduationCap,
  Building,
  Award,
  DollarSign,
  Users,
  Shield,
  ArrowRight,
  ExternalLink,
  Check,
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { CONTRACT_IDS, GRANTFOX_URL } from '../constants/config'

const STELLAR_EXPERT_CONTRACT =
  'https://stellar.expert/explorer/testnet/contract'

const APP_DOWNLOAD_URL = 'https://expo.dev/accounts/stepfi-app'
const GITHUB_ORG_URL = 'https://github.com/StepFi-app'

const ACCENT = {
  learner: '#2563EB',
  sponsor: '#22C55E',
  mentor: '#F59E0B',
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

interface SectionProps {
  id?: string
  className?: string
  children: ReactNode
}

function Section({ id, className, children }: SectionProps) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger}
      className={clsx('py-24 md:py-32', className)}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">{children}</div>
    </motion.section>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle: string
  align?: 'center' | 'left'
}

function SectionHeader({ title, subtitle, align = 'center' }: SectionHeaderProps) {
  return (
    <motion.div
      variants={fadeUp}
      className={clsx(
        'mb-14',
        align === 'center' && 'text-center max-w-2xl mx-auto'
      )}
    >
      <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary mb-4">
        {title}
      </h2>
      <p className="text-text-secondary text-lg">{subtitle}</p>
    </motion.div>
  )
}

function DotGrid() {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          'radial-gradient(rgba(34,197,94,0.12) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        maskImage:
          'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        WebkitMaskImage:
          'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      }}
      animate={{ backgroundPosition: ['0px 0px', '32px 32px'] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    />
  )
}

const heroStats = [
  { value: '5', label: 'Smart Contracts' },
  { value: '13', label: 'API Modules' },
  { value: 'Stellar', label: 'Testnet' },
  { value: 'MIT', label: 'License' },
]

interface Participant {
  icon: LucideIcon
  title: string
  accent: string
  body: string
  tag: string
  cta: string
  href: string
  external: boolean
}

const participants: Participant[] = [
  {
    icon: GraduationCap,
    title: 'Learner',
    accent: ACCENT.learner,
    body: 'Students, interns, and early career developers in emerging markets who need to finance laptops, courses, bootcamps, and dev tools. They connect their Stellar wallet, build a profile, and apply for installment loans. Every on-time payment improves their on-chain reputation score.',
    tag: 'Via mobile app',
    cta: 'Download App',
    href: APP_DOWNLOAD_URL,
    external: true,
  },
  {
    icon: Building,
    title: 'Sponsor',
    accent: ACCENT.sponsor,
    body: 'Individuals, companies, and DAOs that deposit USDC into the StepFi liquidity pool. The pool funds approved learner loans. Sponsors earn yield from interest paid by learners and can withdraw at any time.',
    tag: 'You are here',
    cta: 'Sponsor the Pool',
    href: '/sponsors',
    external: false,
  },
  {
    icon: Award,
    title: 'Mentor',
    accent: ACCENT.mentor,
    body: 'Senior developers with high reputation who vouch for learners. A vouch boosts the learner reputation score, unlocking lower interest rates and higher credit limits. If the learner defaults, the mentor reputation decreases.',
    tag: 'You are here',
    cta: 'Start Vouching',
    href: '/vouch',
    external: false,
  },
]

const sponsorBenefits = [
  'Deposit USDC to the StepFi liquidity pool',
  'Your capital funds approved learner loans',
  'Earn APY from interest on repayments',
  'Withdraw anytime with earned yield',
  'Track which loans your capital backs',
  'All transactions on Stellar blockchain',
]

const poolStats = {
  totalValue: '$48,320',
  available: '$31,200',
  availablePct: 64.6,
  locked: '$17,120',
  lockedPct: 35.4,
  apy: '12.4%',
  activeLoans: '17',
  onTimeRate: '94.2%',
}

interface Benefit {
  icon: LucideIcon
  title: string
  body: string
}

const vendorBenefits: Benefit[] = [
  {
    icon: DollarSign,
    title: 'Get paid upfront',
    body: 'You receive full payment immediately. The learner repays StepFi in installments. You never chase payments.',
  },
  {
    icon: Users,
    title: 'Reach motivated buyers',
    body: 'StepFi learners are developers and students actively investing in their growth. They buy laptops, courses, and dev tools.',
  },
  {
    icon: Shield,
    title: 'Verified on-chain',
    body: 'Your vendor profile lives on the Stellar blockchain. Trust is built in, not bolted on.',
  },
]

const vendorCategories = [
  'Electronics',
  'Bootcamps',
  'Online Courses',
  'Dev Tools',
  'Books',
  'Subscriptions',
]

const mentorSteps = [
  'A learner requests a vouch from you',
  'You review their profile and loan request',
  'You sign a vouch transaction with your wallet',
  'Their reputation score increases',
  'They unlock lower interest rates',
]

const mentorTiers = [
  { tier: 'Bronze (60-74)', boost: '+6 points', duration: '3 months' },
  { tier: 'Silver (75-89)', boost: '+12 points', duration: '6 months' },
  { tier: 'Gold (90-100)', boost: '+18 points', duration: '12 months' },
]

const contracts = [
  { name: 'Creditline', id: CONTRACT_IDS.creditline },
  { name: 'Reputation', id: CONTRACT_IDS.reputation },
  { name: 'Liquidity Pool', id: CONTRACT_IDS.liquidityPool },
  { name: 'Vendor Registry', id: CONTRACT_IDS.vendorRegistry },
  { name: 'Parameters', id: CONTRACT_IDS.parameters },
]

const footerColumns = [
  {
    title: 'Protocol',
    links: [
      { label: 'Docs', href: '/docs', internal: true },
      { label: 'Demo', href: 'https://stepfi.vercel.app/demo' },
      { label: 'Playground', href: 'https://stepfi.vercel.app/playground' },
      { label: 'API Docs', href: 'https://stepfi.vercel.app/api' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: GITHUB_ORG_URL },
      { label: 'Grantfox', href: GRANTFOX_URL },
      { label: 'Discord', href: 'https://discord.gg/stepfi' },
    ],
  },
  {
    title: 'Resources',
    links: [
      {
        label: 'Stellar Expert',
        href: 'https://stellar.expert/explorer/testnet',
      },
      {
        label: 'VERIFICATION.md',
        href: '/contracts',
      },
      {
        label: 'v1.0.0 Release',
        href: 'https://github.com/StepFi-app/StepFi-Web/releases',
      },
    ],
  },
]

function truncateId(id: string) {
  return `${id.slice(0, 8)}...${id.slice(-6)}`
}

function HeroSection() {
  return (
    <section className="relative flex items-center min-h-[calc(100vh-5rem)] overflow-hidden">
      <DotGrid />
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 w-full py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8"
          style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            color: ACCENT.sponsor,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" aria-hidden="true" />
          Live on Stellar Testnet
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display font-bold text-4xl sm:text-5xl md:text-[64px] md:leading-[1.05] text-text-primary mb-6"
        >
          The infrastructure behind
          <br />
          learner credit on Stellar.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          StepFi is an open-source BNPL protocol built on Soroban.
          Sponsors fund a liquidity pool. Vendors list their products.
          Learners get credit without banks. Every repayment builds
          on-chain reputation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link to="/sponsors">
            <Button size="lg" className="w-full sm:w-auto">
              Sponsor the Pool
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/vendors/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              List as Vendor
            </Button>
          </Link>
          <Link to="/vouch">
            <Button size="lg" variant="ghost" className="w-full sm:w-auto">
              Vouch for Learners
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl px-4 py-5 border border-border"
              style={{ background: 'rgba(13,27,42,0.5)' }}
            >
              <div className="font-display font-bold text-2xl text-text-primary">
                {stat.value}
              </div>
              <div className="text-text-muted text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function ParticipantsSection() {
  return (
    <Section>
      <SectionHeader
        title="One protocol. Three participants."
        subtitle="StepFi connects sponsors, vendors, and learners through Soroban smart contracts on Stellar."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {participants.map((p) => (
          <motion.div key={p.title} variants={fadeUp}>
            <Card hover className="h-full flex flex-col">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: `${p.accent}18`,
                  border: `1px solid ${p.accent}30`,
                }}
              >
                <p.icon size={28} style={{ color: p.accent }} />
              </div>
              <h3 className="font-display font-semibold text-xl text-text-primary mb-3">
                {p.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-5 flex-1">
                {p.body}
              </p>
              <span
                className="self-start px-2.5 py-1 rounded-full text-xs font-medium mb-5"
                style={{
                  background: `${p.accent}14`,
                  color: p.accent,
                  border: `1px solid ${p.accent}26`,
                }}
              >
                {p.tag}
              </span>
              {p.external ? (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: p.accent }}
                >
                  {p.cta} <ExternalLink size={14} />
                </a>
              ) : (
                <Link
                  to={p.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: p.accent }}
                >
                  {p.cta} <ArrowRight size={14} />
                </Link>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

function SponsorsSection() {
  return (
    <Section>
      <SectionHeader
        title="Put your capital to work."
        subtitle="Fund the next generation of developers and earn yield while doing it."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <motion.div variants={fadeUp}>
          <ul className="space-y-4">
            {sponsorBenefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span
                  className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.25)',
                  }}
                >
                  <Check size={12} className="text-brand" />
                </span>
                <span className="text-text-secondary">{benefit}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div
            className="rounded-2xl p-6 border border-border"
            style={{
              background: 'rgba(13,27,42,0.6)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-text-primary">
                Pool Overview
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20">
                {poolStats.apy} APY
              </span>
            </div>

            <div className="mb-2">
              <span className="text-text-muted text-sm">Total Value</span>
              <div className="font-display font-bold text-3xl text-text-primary">
                {poolStats.totalValue}
              </div>
            </div>

            <div className="h-2 rounded-full overflow-hidden bg-elevated my-4">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${poolStats.availablePct}%`,
                  background: ACCENT.sponsor,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <div className="flex items-center gap-1.5 text-text-muted">
                  <span className="w-2 h-2 rounded-full bg-brand" />
                  Available
                </div>
                <div className="text-text-primary font-medium mt-1">
                  {poolStats.available}{' '}
                  <span className="text-text-muted">
                    ({poolStats.availablePct}%)
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-text-muted">
                  <span className="w-2 h-2 rounded-full bg-text-muted" />
                  Locked in loans
                </div>
                <div className="text-text-primary font-medium mt-1">
                  {poolStats.locked}{' '}
                  <span className="text-text-muted">
                    ({poolStats.lockedPct}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-sm">
              <div>
                <div className="text-text-muted">Active loans</div>
                <div className="text-text-primary font-medium mt-1">
                  {poolStats.activeLoans}
                </div>
              </div>
              <div>
                <div className="text-text-muted">On-time rate</div>
                <div className="text-text-primary font-medium mt-1">
                  {poolStats.onTimeRate}
                </div>
              </div>
            </div>
          </div>

          <Link to="/sponsors" className="block mt-6">
            <Button size="lg" className="w-full">
              Connect Wallet to Sponsor
              <ArrowRight size={18} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </Section>
  )
}

function VendorsSection() {
  return (
    <Section>
      <SectionHeader
        title="Reach learners who are ready to buy."
        subtitle="List your products on StepFi and get paid upfront while learners repay in installments."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {vendorBenefits.map((benefit) => (
          <motion.div key={benefit.title} variants={fadeUp}>
            <Card hover className="h-full">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                <benefit.icon size={22} className="text-brand" />
              </div>
              <h3 className="font-display font-semibold text-text-primary mb-2">
                {benefit.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {benefit.body}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeUp} className="text-center">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {vendorCategories.map((category) => (
            <span
              key={category}
              className="px-4 py-2 rounded-full text-sm text-text-secondary border border-border"
              style={{ background: 'rgba(13,27,42,0.4)' }}
            >
              {category}
            </span>
          ))}
        </div>
        <Link to="/vendors/register">
          <Button size="lg" variant="outline">
            Register as Vendor
          </Button>
        </Link>
      </motion.div>
    </Section>
  )
}

function MentorsSection() {
  return (
    <Section>
      <SectionHeader
        title="Your reputation can open doors for others."
        subtitle="Vouch for learners you believe in. Help them access better loan terms."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div variants={fadeUp}>
          <ol className="space-y-5">
            {mentorSteps.map((step, index) => (
              <li key={step} className="flex items-start gap-4">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-display font-semibold text-sm"
                  style={{
                    background: `${ACCENT.mentor}18`,
                    color: ACCENT.mentor,
                    border: `1px solid ${ACCENT.mentor}30`,
                  }}
                >
                  {index + 1}
                </span>
                <span className="text-text-secondary pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        <motion.div variants={fadeUp}>
          <table
            className="w-full rounded-2xl border border-border overflow-hidden"
            style={{ background: 'rgba(13,27,42,0.6)' }}
          >
            <caption className="sr-only">Mentor tiers and their reputation boosts</caption>
            <thead>
              <tr className="grid grid-cols-3 px-5 py-3 text-xs font-medium text-text-muted border-b border-border">
                <th className="text-left">Mentor Tier</th>
                <th className="text-center">Reputation Boost</th>
                <th className="text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {mentorTiers.map((row) => (
                <tr
                  key={row.tier}
                  className="grid grid-cols-3 px-5 py-4 text-sm border-b border-border last:border-b-0"
                >
                  <td className="text-text-primary font-medium">
                    {row.tier}
                  </td>
                  <td
                    className="text-center font-medium"
                    style={{ color: ACCENT.mentor }}
                  >
                    {row.boost}
                  </td>
                  <td className="text-right text-text-secondary">
                    {row.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            className="mt-5 rounded-xl px-4 py-3 text-sm"
            style={{
              background: `${ACCENT.mentor}12`,
              border: `1px solid ${ACCENT.mentor}26`,
              color: ACCENT.mentor,
            }}
          >
            If the learner you vouch for defaults, your reputation score
            decreases proportionally.
          </div>

          <Link to="/vouch" className="block mt-6">
            <Button size="lg" variant="outline" className="w-full">
              Connect Wallet to Vouch
              <ArrowRight size={18} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </Section>
  )
}

function ContractsSection() {
  return (
    <Section>
      <SectionHeader
        title="Transparent by design."
        subtitle="Every StepFi operation runs through open-source Soroban contracts on Stellar testnet. Read the code. Verify the hashes."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contracts.map((contract) => (
          <motion.a
            key={contract.name}
            variants={fadeUp}
            href={`${STELLAR_EXPERT_CONTRACT}/${contract.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl p-5 border border-border bg-surface hover:border-brand/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-semibold text-text-primary">
                {contract.name}
              </h3>
              <ExternalLink
                size={16}
                className="text-text-muted group-hover:text-brand transition-colors"
              />
            </div>
            <code className="font-mono text-sm text-text-secondary">
              {truncateId(contract.id)}
            </code>
          </motion.a>
        ))}
      </div>
    </Section>
  )
}

function ContributeSection() {
  return (
    <Section>
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-10 md:p-14 text-center"
        style={{
          background: 'rgba(13,27,42,0.6)',
          border: '1px solid rgba(30,58,82,0.6)',
        }}
      >
        <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary mb-4">
          StepFi is open source.
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto mb-8">
          37 labeled issues across 3 repos. Good first issues, medium, and
          hard. Earn Stellar rewards through Grantfox for every merged PR.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={GRANTFOX_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full sm:w-auto">
              Contribute on Grantfox
              <ExternalLink size={16} />
            </Button>
          </a>
          <a href={GITHUB_ORG_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Browse Issues
            </Button>
          </a>
        </div>
      </motion.div>
    </Section>
  )
}

function FooterLinksStrip() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger}
      className="max-w-7xl mx-auto px-6 md:px-12 pb-12"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-border">
        {footerColumns.map((column) => (
          <motion.div key={column.title} variants={fadeUp}>
            <h3 className="font-display font-semibold text-text-primary mb-4">
              {column.title}
            </h3>
            <ul className="space-y-3">
              {column.links.map((link) => {
                if ('internal' in link && link.internal) {
                  return (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-text-muted hover:text-brand transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                }
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-text-muted hover:text-brand transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export function Home() {
  return (
    <div>
      <HeroSection />
      <ParticipantsSection />
      <SponsorsSection />
      <VendorsSection />
      <MentorsSection />
      <ContractsSection />
      <ContributeSection />
      <FooterLinksStrip />
    </div>
  )
}
