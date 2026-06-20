import { useWallet } from '../hooks/useWallet'
import { Link } from 'react-router-dom'
import { Building, Store, Award, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function Dashboard() {
  const { address, isConnected } = useWallet()

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24
        text-center">
        <h1 className="font-display font-bold text-3xl
          text-text-primary mb-4">
          Connect your wallet to continue
        </h1>
        <p className="text-text-secondary mb-8">
          You need a Stellar wallet to access
          the dashboard.
        </p>
        <Link to="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-text-muted text-sm
          font-mono mb-1">
          Connected wallet
        </p>
        <h1 className="font-display font-bold text-3xl
          text-text-primary">
          {address.slice(0, 8)}...{address.slice(-6)}
        </h1>
      </div>

      <p className="text-text-secondary mb-8 text-lg">
        What are you here to do?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3
        gap-6">

        <Link to="/sponsors" aria-label="Sponsor dashboard: deposit to liquidity pool and earn yield">
          <div className="rounded-2xl p-8 cursor-pointer
            transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(13,27,42,0.8)',
              border: '1px solid rgba(34,197,94,0.3)',
            }}>
            <Building size={36}
              className="text-brand mb-4" aria-hidden="true" />
            <h3 className="font-display font-bold
              text-xl text-text-primary mb-2">
              Sponsor
            </h3>
            <p className="text-text-secondary text-sm
              leading-relaxed">
              Deposit to the liquidity pool, fund
              learner loans, and earn yield on
              your capital.
            </p>
            <div className="flex items-center gap-1
              mt-6 text-brand text-sm font-medium">
              Go to Sponsor Dashboard
              <ArrowRight size={14} aria-hidden="true" />
            </div>
          </div>
        </Link>

        <Link to="/vendors" aria-label="Vendor dashboard: list products and get paid upfront">
          <div className="rounded-2xl p-8 cursor-pointer
            transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(13,27,42,0.8)',
              border: '1px solid rgba(37,99,235,0.3)',
            }}>
            <Store size={36}
              style={{ color: '#2563EB' }}
              className="mb-4" aria-hidden="true" />
            <h3 className="font-display font-bold
              text-xl text-text-primary mb-2">
              Vendor
            </h3>
            <p className="text-text-secondary text-sm
              leading-relaxed">
              List your products and services.
              Get paid upfront while learners
              repay in installments.
            </p>
            <div className="flex items-center gap-1
              mt-6 text-sm font-medium"
              style={{ color: '#2563EB' }}>
              Go to Vendor Dashboard
              <ArrowRight size={14} aria-hidden="true" />
            </div>
          </div>
        </Link>

        <Link to="/vouch" aria-label="Mentor dashboard: vouch for learners and help them access better loan terms">
          <div className="rounded-2xl p-8 cursor-pointer
            transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(13,27,42,0.8)',
              border: '1px solid rgba(245,158,11,0.3)',
            }}>
            <Award size={36}
              style={{ color: '#F59E0B' }}
              className="mb-4" aria-hidden="true" />
            <h3 className="font-display font-bold
              text-xl text-text-primary mb-2">
              Mentor
            </h3>
            <p className="text-text-secondary text-sm
              leading-relaxed">
              Vouch for learners you believe in.
              Help them access better loan terms
              with your reputation.
            </p>
            <div className="flex items-center gap-1
              mt-6 text-sm font-medium"
              style={{ color: '#F59E0B' }}>
              Go to Mentor Dashboard
              <ArrowRight size={14} aria-hidden="true" />
            </div>
          </div>
        </Link>

      </div>
    </div>
  )
}
