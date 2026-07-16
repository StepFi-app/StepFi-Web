import { useNavigate } from 'react-router-dom'
import { Building, Store, Award } from 'lucide-react'
import { useRoleStore } from '../stores/role.store'
import { useWallet } from '../hooks/useWallet'

const roles = [
  {
    value: 'sponsor' as const,
    title: 'Sponsor',
    description: 'Deposit to the liquidity pool, fund learner loans, and earn yield on your capital.',
    icon: Building,
    color: '#22C55E',
    borderColor: 'rgba(34,197,94,0.3)',
    route: '/sponsors',
  },
  {
    value: 'vendor' as const,
    title: 'Vendor',
    description: 'List your products and services. Get paid upfront while learners repay in installments.',
    icon: Store,
    color: '#2563EB',
    borderColor: 'rgba(37,99,235,0.3)',
    route: '/vendors/dashboard',
  },
  {
    value: 'mentor' as const,
    title: 'Mentor',
    description: 'Vouch for learners you believe in. Help them access better loan terms with your reputation.',
    icon: Award,
    color: '#F59E0B',
    borderColor: 'rgba(245,158,11,0.3)',
    route: '/vouch',
  },
]

export function RoleSelect() {
  const navigate = useNavigate()
  const { isConnected } = useWallet()
  const setRole = useRoleStore((s) => s.setRole)

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display font-semibold text-2xl text-text-primary mb-4">
          Connect your wallet to continue
        </h1>
        <p className="text-text-secondary">
          You need a Stellar wallet to access the dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="text-center mb-12">
        <h1 className="font-display font-semibold text-2xl text-text-primary mb-3">
          What are you here to do?
        </h1>
        <p className="text-text-muted text-lg">
          Pick the role that best describes how you want to use StepFi.
          You can change this later in settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => {
              setRole(role.value)
              navigate(role.route)
            }}
            className="rounded-xl p-6 text-left cursor-pointer
              transition-all hover:scale-[1.02] focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-brand"
            style={{
              background: 'rgba(13,27,42,0.8)',
              border: `1px solid ${role.borderColor}`,
            }}
            aria-label={`Select ${role.title} role`}
          >
            <role.icon size={24} style={{ color: role.color }} className="mb-3" aria-hidden="true" />
            <h3 className="font-display font-bold text-xl text-text-primary mb-2">
              {role.title}
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {role.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
