import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Wallet, BarChart3, ArrowRight, Check, AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { poolService } from '../services/pool.service'
import { useAppStore } from '../stores/app.store'
import { useWallet } from '../hooks/useWallet'
import { GRANTFOX_URL } from '../constants/config'

const steps = [
  { title: 'Welcome', icon: Wallet },
  { title: 'Risks', icon: AlertTriangle },
  { title: 'Pool Health', icon: BarChart3 },
  { title: 'Deposit', icon: ArrowRight },
]

const fadeSlide: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.25, ease: 'easeIn' } },
}

function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Onboarding progress" className="max-w-xl mx-auto mb-12">
      <ol className="flex items-center justify-between mb-3">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-2" aria-current={i === current ? 'step' : undefined}>
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < current
                  ? 'bg-brand text-bg'
                  : i === current
                    ? 'bg-brand/20 text-brand border border-brand'
                    : 'bg-surface text-text-muted border border-border'
              }`}
              aria-hidden="true"
            >
              {i < current ? <Check size={14} aria-hidden="true" /> : i + 1}
            </span>
            <span
              className={`hidden sm:block text-sm font-medium ${
                i <= current ? 'text-text-primary' : 'text-text-muted'
              }`}
            >
              {s.title}
            </span>
          </li>
        ))}
      </ol>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label={`Step ${current + 1} of ${steps.length}`}>
        <div
          className="h-full bg-brand transition-all duration-500 rounded-full"
          style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </nav>
  )
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <motion.div key="welcome" variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center mx-auto mb-6">
        <Wallet size={32} className="text-brand" />
      </div>
      <h1 className="font-display font-bold text-3xl text-text-primary mb-4">
        Welcome to the Sponsor Pool
      </h1>
      <p className="text-text-secondary leading-relaxed mb-3">
        StepFi connects sponsors like you with verified learners who need
        affordable financing for education, tools, and career growth.
      </p>
      <p className="text-text-secondary leading-relaxed mb-8">
        When you deposit USDC into the pool, your capital gets deployed to
        real learner loans. You earn yield from the interest learners pay back,
        and you can withdraw your deposit plus earned yield at any time.
      </p>
      <Button onClick={onNext} size="lg">
        Get Started <ArrowRight size={16} />
      </Button>
    </motion.div>
  )
}

const risks = [
  {
    title: 'Default Risk',
    body: 'Learners may fail to repay their loans. While StepFi uses on-chain reputation scores to vet borrowers, past performance does not guarantee future results. Defaults reduce pool returns and may impact principal.',
    severity: 'high',
  },
  {
    title: 'Smart Contract Risk',
    body: 'The pool is managed by Stellar smart contracts that have been developed and tested, but no software is guaranteed bug-free. Exploits or vulnerabilities could result in loss of funds.',
    severity: 'medium',
  },
  {
    title: 'Market & Liquidity Risk',
    body: 'If a large number of sponsors withdraw simultaneously, the pool may temporarily hold insufficient liquid capital to process all withdrawals. Withdrawals are processed on a first-come, first-served basis from available liquidity.',
    severity: 'medium',
  },
  {
    title: 'Protocol Risk',
    body: 'StepFi is an early-stage protocol. The platform, its smart contracts, and its business model may change or be discontinued. There is no guarantee of continued operation or future returns.',
    severity: 'high',
  },
]

function StepRisks({ onNext }: { onNext: () => void }) {
  return (
    <motion.div key="risks" variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-amber-400" />
        </div>
        <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
          Understand the Risks
        </h2>
        <p className="text-text-secondary text-sm">
          Sponsor pools offer attractive returns, but they are not risk-free.
          Please read each risk carefully before depositing.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {risks.map((risk) => (
          <Card key={risk.title}>
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  risk.severity === 'high' ? 'bg-red-500' : 'bg-amber-400'
                }`}
              />
              <div>
                <h3 className="font-semibold text-text-primary mb-1">{risk.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{risk.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={onNext} size="lg" className="w-full">
        I Understand <ArrowRight size={16} />
      </Button>
    </motion.div>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function StepPoolHealth({ onNext }: { onNext: () => void }) {
  const [depositAmount, setDepositAmount] = useState('')
  const { data: pool, isLoading } = useQuery({
    queryKey: ['pool-info'],
    queryFn: () => poolService.getPoolInfo(),
    refetchInterval: 30_000,
  })

  const depositNum = parseFloat(depositAmount) || 0
  const apy = pool?.apy ?? 0
  const yearlyYield = depositNum * apy
  const monthlyYield = yearlyYield / 12

  return (
    <motion.div key="pool" variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center mx-auto mb-6">
          <BarChart3 size={32} className="text-brand" />
        </div>
        <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
          Current Pool Health
        </h2>
        <p className="text-text-secondary text-sm">
          Real-time metrics from the StepFi liquidity pool.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : pool ? (
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Card>
            <p className="text-text-muted text-xs font-medium mb-1">Total Deposits</p>
            <p className="font-display font-bold text-xl text-text-primary">
              {formatCurrency(pool.totalDeposits)}
            </p>
          </Card>
          <Card>
            <p className="text-text-muted text-xs font-medium mb-1">APY</p>
            <p className="font-display font-bold text-xl text-brand">
              {(apy * 100).toFixed(1)}%
            </p>
          </Card>
          <Card>
            <p className="text-text-muted text-xs font-medium mb-1">Available Liquidity</p>
            <p className="font-display font-bold text-xl text-text-primary">
              {formatCurrency(pool.availableLiquidity)}
            </p>
          </Card>
          <Card>
            <p className="text-text-muted text-xs font-medium mb-1">Locked in Loans</p>
            <p className="font-display font-bold text-xl text-text-primary">
              {formatCurrency(pool.lockedLiquidity)}
            </p>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-8 mb-8">
          <p className="text-text-secondary">Unable to load pool data.</p>
        </Card>
      )}

        <Card className="mb-8">
        <h3 className="font-semibold text-text-primary mb-3">Yield Preview</h3>
        <label htmlFor="deposit-amount" className="text-text-muted text-xs mb-3 block">
          Enter a deposit amount to see your estimated returns.
        </label>
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-medium" aria-hidden="true">$</span>
          <input
            id="deposit-amount"
            type="number"
            placeholder="0"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl px-8 py-2.5 text-text-primary
              font-display font-bold text-lg outline-none focus:border-brand transition-colors
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        {depositNum > 0 && (
          <div className="space-y-2 pt-3 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Yearly yield</span>
              <span className="text-text-primary font-semibold">${yearlyYield.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Monthly yield</span>
              <span className="text-text-primary font-semibold">${monthlyYield.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Card>

      <Button onClick={onNext} size="lg" className="w-full">
        Continue <ArrowRight size={16} />
      </Button>
    </motion.div>
  )
}

function StepDeposit({ onComplete }: { onComplete: () => void }) {
  const { isConnected, connectFreighter } = useWallet()

  return (
    <motion.div key="deposit" variants={fadeSlide} initial="initial" animate="animate" exit="exit" className="text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center mx-auto mb-6">
        <ArrowRight size={32} className="text-brand" />
      </div>
      <h2 className="font-display font-bold text-2xl text-text-primary mb-4">
        Make Your First Deposit
      </h2>
      <p className="text-text-secondary leading-relaxed mb-8">
        Connect your Stellar wallet and deposit USDC to start earning yield
        while funding real learner dreams. You can deposit any amount and
        withdraw anytime.
      </p>

      {!isConnected ? (
        <Button onClick={connectFreighter} size="lg" className="w-full">
          Connect Freighter Wallet
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Your wallet is connected. Head to the sponsor dashboard to make
            your first deposit.
          </p>
          <Button onClick={onComplete} size="lg" className="w-full">
            Go to Sponsor Dashboard <ExternalLink size={16} />
          </Button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs text-text-muted leading-relaxed">
          No wallet yet? You can also contribute via
          {' '}
          <a
            href={GRANTFOX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            GrantFox
          </a>.
        </p>
      </div>
    </motion.div>
  )
}

export function SponsorOnboarding() {
  const [step, setStep] = useState(0)
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)
  const navigate = useNavigate()

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    }
  }

  const handleComplete = () => {
    setOnboardingComplete(true)
    navigate('/sponsors')
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        {step === 0 && <StepWelcome key="welcome" onNext={handleNext} />}
        {step === 1 && <StepRisks key="risks" onNext={handleNext} />}
        {step === 2 && <StepPoolHealth key="pool" onNext={handleNext} />}
        {step === 3 && <StepDeposit key="deposit" onComplete={handleComplete} />}
      </AnimatePresence>

      {step > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setStep(step - 1)}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
            aria-label={`Go back to ${steps[step - 1].title} step`}
          >
            Back
          </button>
        </div>
      )}
    </div>
  )
}
