import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'sponsor' | 'vendor' | 'mentor' | null

export const ROLE_ROUTES: Record<Exclude<UserRole, null>, string> = {
  sponsor: '/sponsors',
  vendor: '/vendors/dashboard',
  mentor: '/mentor',
}

interface RoleStore {
  role: UserRole
  roleSelected: boolean
  setRole: (role: UserRole) => void
  clearRole: () => void
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      role: null,
      roleSelected: false,
      setRole: (role) =>
        set({ role, roleSelected: true }),
      clearRole: () =>
        set({ role: null, roleSelected: false }),
    }),
    { name: 'stepfi-role' }
  )
)
