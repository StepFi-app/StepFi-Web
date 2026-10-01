import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Layout } from '../components/layout/Layout'
import { Spinner } from '../components/ui/Spinner'
import { useRoleStore } from '../stores/role.store'
import type { UserRole } from '../stores/role.store'
import { useWallet } from '../hooks/useWallet'
import { useAppStore } from '../stores/app.store'
import { setSessionExpiredHandler } from '../services/api'

// Route pages are code-split so heavy per-page dependencies (e.g. the Stellar
// SDK pulled in by the dashboard/vouch flows) load on demand instead of
// inflating the initial bundle. Pages use named exports, so each is mapped to a
// default export for React.lazy.
const Home = lazy(() => import('../pages/Home').then((m) => ({ default: m.Home })))
const Docs = lazy(() => import('../pages/Docs').then((m) => ({ default: m.Docs })))
const Contracts = lazy(() => import('../pages/Contracts').then((m) => ({ default: m.Contracts })))
const Dashboard = lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Vendors = lazy(() => import('../pages/Vendors').then((m) => ({ default: m.Vendors })))
const VendorDetail = lazy(() => import('../pages/VendorDetail').then((m) => ({ default: m.VendorDetail })))
const VendorRegister = lazy(() => import('../pages/VendorRegister').then((m) => ({ default: m.VendorRegister })))
const VendorDashboard = lazy(() => import('../pages/VendorDashboard').then((m) => ({ default: m.VendorDashboard })))
const Sponsors = lazy(() => import('../pages/Sponsors').then((m) => ({ default: m.Sponsors })))
const SponsorOnboarding = lazy(() => import('../pages/SponsorOnboarding').then((m) => ({ default: m.SponsorOnboarding })))
const Vouch = lazy(() => import('../pages/Vouch').then((m) => ({ default: m.Vouch })))
const MentorDashboard = lazy(() => import('../pages/MentorDashboard').then((m) => ({ default: m.MentorDashboard })))
const LearnerProfile = lazy(() => import('../pages/LearnerProfile').then((m) => ({ default: m.LearnerProfile })))
const NotFound = lazy(() => import('../pages/NotFound').then((m) => ({ default: m.NotFound })))
const History = lazy(() => import('../pages/History').then((m) => ({ default: m.History })))
const RoleSelect = lazy(() => import('../pages/RoleSelect').then((m) => ({ default: m.RoleSelect })))

function RoleGuard({
  allowedRole,
  children,
}: {
  allowedRole: UserRole
  children: ReactNode
}) {
  const { isConnected } = useWallet()
  const { role, roleSelected } = useRoleStore()

  if (!isConnected) {
    return <Navigate to="/" replace />
  }
  if (!roleSelected) {
    return <Navigate to="/role-select" replace />
  }
  if (role !== allowedRole) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

// Layout (Navbar + Footer) renders immediately; only the lazily-loaded page
// content suspends, so the navigation chrome never flashes on route changes.
function page(node: ReactNode) {
  return (
    <Layout>
      <RedirectOnSessionExpiry />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-32">
            <Spinner size={28} />
          </div>
        }
      >
        {node}
      </Suspense>
    </Layout>
  )
}

/**
 * Sends the user to /dashboard with a client-side redirect once the API layer
 * reports that the session is unrecoverable.
 *
 * `/dashboard` is the role dispatcher: it reads the role store and forwards to
 * the correct surface (or to `/` when no role is selected), which is the right
 * entry point for a signed-out session.
 *
 * This exists so `src/services/api.ts` never has to assign `window.location`:
 * a full document reload discards all React and store state. The service calls
 * a handler that this component registers, and React Router performs the
 * navigation.
 */
function RedirectOnSessionExpiry() {
  const sessionExpired = useAppStore((s) => s.sessionExpired)

  if (!sessionExpired) return null
  return <Navigate to="/dashboard" replace />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: page(<Home />),
  },
  {
    path: '/docs',
    element: page(<Docs />),
  },
  {
    path: '/contracts',
    element: page(<Contracts />),
  },
  {
    path: '/role-select',
    element: page(<RoleSelect />),
  },
  {
    path: '/dashboard',
    element: page(<Dashboard />),
  },
  {
    path: '/vendors',
    element: page(<Vendors />),
  },
  {
    path: '/vendors/dashboard',
    element: page(<RoleGuard allowedRole="vendor"><VendorDashboard /></RoleGuard>),
  },
  {
    path: '/vendors/register',
    element: page(<RoleGuard allowedRole="vendor"><VendorRegister /></RoleGuard>),
  },
  {
    path: '/vendors/:id',
    element: page(<VendorDetail />),
  },
  {
    path: '/sponsors',
    element: page(<RoleGuard allowedRole="sponsor"><Sponsors /></RoleGuard>),
  },
  {
    path: '/sponsors/onboarding',
    element: page(<RoleGuard allowedRole="sponsor"><SponsorOnboarding /></RoleGuard>),
  },
  {
    path: '/mentor',
    element: page(<RoleGuard allowedRole="mentor"><MentorDashboard /></RoleGuard>),
  },
  {
    path: '/vouch',
    element: page(<RoleGuard allowedRole="mentor"><Vouch /></RoleGuard>),
  },
  {
    path: '/learner/:walletAddress',
    element: page(<LearnerProfile />),
  },
  {
    path: '/history',
    element: page(<History />),
  },
  {
    path: '*',
    element: page(<NotFound />),
  },
])

export function Router() {
  useEffect(() => {
    // Register the redirect once, at the top of the app: the API layer has no
    // router context of its own, so this is how it hands the "session is over"
    // signal back to React Router.
    setSessionExpiredHandler(() => useAppStore.getState().setSessionExpired(true))
    return () => setSessionExpiredHandler(null)
  }, [])

  return <RouterProvider router={router} />
}
