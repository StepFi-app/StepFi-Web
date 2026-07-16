import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'sponsor' | 'vendor' | 'mentor' | null

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
