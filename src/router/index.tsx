import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Home } from '../pages/Home'
import { Docs } from '../pages/Docs'
import { Contracts } from '../pages/Contracts'
import { Dashboard } from '../pages/Dashboard'
import { Vendors } from '../pages/Vendors'
import { VendorRegister } from '../pages/VendorRegister'
import { VendorDashboard } from '../pages/VendorDashboard'
import { Sponsors } from '../pages/Sponsors'
import { SponsorOnboarding } from '../pages/SponsorOnboarding'
import { Vouch } from '../pages/Vouch'
import { LearnerProfile } from '../pages/LearnerProfile'
import { NotFound } from '../pages/NotFound'

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
    path: '/dashboard',
    element: <Layout><Dashboard /></Layout>,
  },
  {
    path: '/vendors',
    element: <Layout><Vendors /></Layout>,
  },
  {
    path: '/vendors/dashboard',
    element: <Layout><VendorDashboard /></Layout>,
  },
  {
    path: '/vendors/register',
    element: <Layout><VendorRegister /></Layout>,
  },
  {
    path: '/sponsors',
    element: <Layout><Sponsors /></Layout>,
  },
  {
    path: '/sponsors/onboarding',
    element: <Layout><SponsorOnboarding /></Layout>,
  },
  {
    path: '/vouch',
    element: <Layout><Vouch /></Layout>,
  },
  {
    path: '/learner/:walletAddress',
    element: <Layout><LearnerProfile /></Layout>,
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
