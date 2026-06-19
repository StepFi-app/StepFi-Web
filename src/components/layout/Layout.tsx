import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text-primary
      font-body">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="pt-20" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
