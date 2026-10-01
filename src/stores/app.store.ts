import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppStore {
  mobileMenuOpen: boolean
  onboardingComplete: boolean
  theme: 'dark' | 'light'
  /**
   * Set when a token refresh failed and the session cannot be recovered. The
   * router watches this to redirect the user without a full page reload.
   */
  sessionExpired: boolean
  setMobileMenuOpen: (open: boolean) => void
  setOnboardingComplete: (complete: boolean) => void
  setSessionExpired: (expired: boolean) => void
  toggleTheme: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      mobileMenuOpen: false,
      onboardingComplete: false,
      theme: 'dark',
      sessionExpired: false,
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      setOnboardingComplete: (onboardingComplete) =>
        set({ onboardingComplete }),
      setSessionExpired: (sessionExpired) => set({ sessionExpired }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
    }),
    {
      name: 'stepfi-app',
      // A transient navigation signal must not survive a reload, or a later
      // visit would bounce the user straight back to the dashboard.
      partialize: (state) => ({ theme: state.theme }),
    }
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
