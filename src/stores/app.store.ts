import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppStore {
  mobileMenuOpen: boolean
  onboardingComplete: boolean
  setMobileMenuOpen: (open: boolean) => void
  setOnboardingComplete: (complete: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      mobileMenuOpen: false,
      onboardingComplete: false,
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      setOnboardingComplete: (onboardingComplete) =>
        set({ onboardingComplete }),
    }),
    { name: 'stepfi-app' }
  )
)
