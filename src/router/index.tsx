import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Home } from '../pages/Home'
import { Docs } from '../pages/Docs'
import { Contracts } from '../pages/Contracts'
import { Dashboard } from '../pages/Dashboard'
import { Vendors } from '../pages/Vendors'
import { VendorDetail } from '../pages/VendorDetail'
import { VendorRegister } from '../pages/VendorRegister'
import { VendorDashboard } from '../pages/VendorDashboard'
import { Sponsors } from '../pages/Sponsors'
import { SponsorOnboarding } from '../pages/SponsorOnboarding'
import { Vouch } from '../pages/Vouch'
import { LearnerProfile } from '../pages/LearnerProfile'
import { NotFound } from '../pages/NotFound'
import { History } from '../pages/History'
import { RoleSelect } from '../pages/RoleSelect'
import { useRoleStore } from '../stores/role.store'
import type { UserRole } from '../stores/role.store'
import { useWallet } from '../hooks/useWallet'
import type { ReactNode } from 'react'

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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>,
  },
  {
    path: '/docs',
    element: <Layout><Docs /></Layout>,
  },
  {
    path: '/contracts',
    element: <Layout><Contracts /></Layout>,
  },
  {
    path: '/role-select',
    element: <Layout><RoleSelect /></Layout>,
  },
  {
    path: '/dashboard',
    element: <Layout><Dashboard /></Layout>,
  },
  {
    path: '/vendors',
    element: <Layout><Vendors /></Layout>,
  },
  {
    path: '/vendors/dashboard',
    element: <Layout><RoleGuard allowedRole="vendor"><VendorDashboard /></RoleGuard></Layout>,
  },
  {
    path: '/vendors/register',
    element: <Layout><RoleGuard allowedRole="vendor"><VendorRegister /></RoleGuard></Layout>,
  },
  {
    path: '/vendors/:id',
    element: <Layout><VendorDetail /></Layout>,
  },
  {
    path: '/sponsors',
    element: <Layout><RoleGuard allowedRole="sponsor"><Sponsors /></RoleGuard></Layout>,
  },
  {
    path: '/sponsors/onboarding',
    element: <Layout><RoleGuard allowedRole="sponsor"><SponsorOnboarding /></RoleGuard></Layout>,
  },
  {
    path: '/vouch',
    element: <Layout><RoleGuard allowedRole="mentor"><Vouch /></RoleGuard></Layout>,
  },
  {
    path: '/learner/:walletAddress',
    element: <Layout><LearnerProfile /></Layout>,
  },
  {
    path: '/history',
    element: <Layout><History /></Layout>,
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
