import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppStore {
  mobileMenuOpen: boolean
  onboardingComplete: boolean
  theme: 'dark' | 'light'
  setMobileMenuOpen: (open: boolean) => void
  setOnboardingComplete: (complete: boolean) => void
  toggleTheme: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      mobileMenuOpen: false,
      onboardingComplete: false,
      theme: 'dark',
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      setOnboardingComplete: (onboardingComplete) =>
        set({ onboardingComplete }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
    }),
    { name: 'stepfi-app' }
  )
)

// Apply saved theme immediately to prevent flash before React renders
try {
  const raw = localStorage.getItem('stepfi-app')
  if (raw) {
    const parsed = JSON.parse(raw)
    if (parsed?.state?.theme === 'light') {
      document.documentElement.classList.add('light')
    }
  }
} catch {
  // ignore
}
