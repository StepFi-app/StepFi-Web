import { createBrowserRouter, RouterProvider } from 'react-router-dom'
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
import { MentorDashboard } from '../pages/MentorDashboard'
import { LearnerProfile } from '../pages/LearnerProfile'
import { NotFound } from '../pages/NotFound'
import { History } from '../pages/History'
import { RoleSelect } from '../pages/RoleSelect'
import { RouteGuard } from '../components/auth/RouteGuard'
import type { UserRole } from '../stores/role.store'

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
    element: <Layout><RouteGuard requireAuth><RoleSelect /></RouteGuard></Layout>,
  },
  {
    path: '/dashboard',
    element: <Layout><RouteGuard requireAuth><Dashboard /></RouteGuard></Layout>,
  },
  {
    path: '/vendors',
    element: <Layout><Vendors /></Layout>,
  },
  {
    path: '/vendors/dashboard',
    element: <Layout><RouteGuard requireAuth allowedRole="vendor"><VendorDashboard /></RouteGuard></Layout>,
  },
  {
    path: '/vendors/register',
    element: <Layout><RouteGuard requireAuth allowedRole="vendor"><VendorRegister /></RouteGuard></Layout>,
  },
  {
    path: '/vendors/:id',
    element: <Layout><VendorDetail /></Layout>,
  },
  {
    path: '/sponsors',
    element: <Layout><RouteGuard requireAuth allowedRole="sponsor"><Sponsors /></RouteGuard></Layout>,
  },
  {
    path: '/sponsors/onboarding',
    element: <Layout><RouteGuard requireAuth allowedRole="sponsor"><SponsorOnboarding /></RouteGuard></Layout>,
  },
  {
    path: '/mentor',
    element: <Layout><RouteGuard requireAuth allowedRole="mentor"><MentorDashboard /></RouteGuard></Layout>,
  },
  {
    path: '/vouch',
    element: <Layout><RouteGuard requireAuth allowedRole="mentor"><Vouch /></RouteGuard></Layout>,
  },
  {
    path: '/learner/:walletAddress',
    element: <Layout><LearnerProfile /></Layout>,
  },
  {
    path: '/history',
    element: <Layout><RouteGuard requireAuth><History /></RouteGuard></Layout>,
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
