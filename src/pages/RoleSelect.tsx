import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { Building, Store, Award } from 'lucide-react'
import { useRoleStore, ROLE_ROUTES } from '../stores/role.store'
import { useUserStore } from '../stores/user.store'
import { useWallet } from '../hooks/useWallet'
import { useToast } from '../hooks/useToast'
import { usersService } from '../services/users.service'
import { authService } from '../services/auth.service'
import { Spinner } from '../components/ui/Spinner'
import { colors } from '../constants/colors'

type SelectableRole = 'sponsor' | 'vendor' | 'mentor'

const roles = [
  {
    value: 'sponsor' as const,
    title: 'Sponsor',
    description: 'Deposit to the liquidity pool, fund learner loans, and earn yield on your capital.',
    icon: Building,
    color: colors.brand,
    borderColor: 'rgba(34,197,94,0.3)',
    route: '/sponsors',
  },
  {
    value: 'vendor' as const,
    title: 'Vendor',
    description: 'List your products and services. Get paid upfront while learners repay in installments.',
    icon: Store,
    color: colors.brandBlue,
    borderColor: 'rgba(37,99,235,0.3)',
    route: '/vendors/dashboard',
  },
  {
    value: 'mentor' as const,
    title: 'Mentor',
    description: 'Vouch for learners you believe in. Help them access better loan terms with your reputation.',
    icon: Award,
    color: colors.amber,
    borderColor: 'rgba(245,158,11,0.3)',
    route: '/vouch',
  },
]

export function RoleSelect() {
  const navigate = useNavigate()
  const { isConnected } = useWallet()
  const { toast } = useToast()
  const setRole = useRoleStore((s) => s.setRole)
  const [selecting, setSelecting] = useState<SelectableRole | null>(null)

  /**
   * Refreshes the JWT so it carries the role claim just persisted by the
   * backend — role-gated endpoints reject tokens issued before the role
   * was set.
   */
  const refreshAccessToken = async () => {
    const { refreshToken, setTokens } = useUserStore.getState()
    const tokens = await authService.refresh(refreshToken)
    setTokens(tokens.accessToken, tokens.refreshToken)
  }

  const handleSelectRole = async (role: SelectableRole, route: string) => {
    if (selecting) return
    setSelecting(role)
    try {
      await usersService.setRole(role)
      await refreshAccessToken()
      setRole(role)
      navigate(route)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        // Role was already set for this wallet (possibly on another
        // device). Sync the real role from the backend and route there.
        try {
          const me = await usersService.getMe()
          if (me.role) {
            await refreshAccessToken()
            setRole(me.role)
            toast.error(`Your role is already set to ${me.role} and cannot be changed.`)
            navigate(ROLE_ROUTES[me.role])
            return
          }
        } catch {
          // fall through to the generic error below
        }
      }
      const message =
        error instanceof Error ? error.message : 'Failed to set role. Please try again.'
      toast.error(message)
    } finally {
      setSelecting(null)
    }
  }

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
          This choice is permanent for your wallet and cannot be changed later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => handleSelectRole(role.value, role.route)}
            disabled={selecting !== null}
            className="rounded-xl p-6 text-left cursor-pointer
              transition-all hover:scale-[1.02] focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-brand
              disabled:opacity-60 disabled:cursor-wait"
            style={{
              background: 'rgba(13,27,42,0.8)',
              border: `1px solid ${role.borderColor}`,
            }}
            aria-label={`Select ${role.title} role (permanent)`}
            aria-busy={selecting === role.value}
          >
            {selecting === role.value ? (
              <Spinner size={24} />
            ) : (
              <role.icon size={24} style={{ color: role.color }} className="mb-3" aria-hidden="true" />
            )}
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
