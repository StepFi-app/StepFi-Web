import { api } from './api'
import type { UserProfile } from '../types'

export const usersService = {
  /**
   * One-time role selection (PATCH /users/me/role).
   * Returns 409 if the wallet already has a role — roles are permanent.
   * After a successful call the client must refresh its access token so
   * the new JWT carries the role claim required by role-gated endpoints.
   */
  setRole: async (
    role: 'sponsor' | 'vendor' | 'mentor'
  ): Promise<{ wallet: string; role: 'sponsor' | 'vendor' | 'mentor' }> => {
    const res = await api.patch('/users/me/role', { role })
    return res.data.data
  },

  getMe: async (): Promise<UserProfile> => {
    const res = await api.get('/users/me')
    return res.data.data
  },
}
