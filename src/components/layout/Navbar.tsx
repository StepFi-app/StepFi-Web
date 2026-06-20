import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, ExternalLink } from 'lucide-react'
import { useWallet } from '../../hooks/useWallet'
import { Button } from '../ui/Button'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/vouch', label: 'Vouch' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const { address, isConnected, connectFreighter, disconnectWallet } = useWallet()

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handle)
    return () => window.removeEventListener('scroll', handle)
  }, [])

  return (
    <nav
      className="fixed top-0 w-full z-50 transition-all duration-300"
      aria-label="Main navigation"
      style={{
        background: scrolled
          ? 'rgba(8,15,26,0.95)'
          : 'rgba(8,15,26,0.6)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled
          ? '1px solid rgba(30,58,82,0.8)'
          : '1px solid rgba(30,58,82,0.2)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4
        flex items-center justify-between">

        <Link 
          to="/" 
          className="flex items-center gap-2 group"
          onClick={() => setMobileOpen(false)}
          aria-label="StepFi home"
        >
          <svg width="28" height="24" viewBox="0 0 28 24" aria-hidden="true">
            <rect x="0" y="18" width="6" height="6"
              rx="1.5" fill="#1D4ED8"/>
            <rect x="8" y="12" width="6" height="12"
              rx="1.5" fill="#2563EB"/>
            <rect x="16" y="6" width="6" height="18"
              rx="1.5" fill="#4ADE80"/>
            <rect x="22" y="0" width="6" height="24"
              rx="1.5" fill="#22C55E"/>
          </svg>
          <span className="font-display font-bold text-lg
            text-text-primary group-hover:text-brand
            transition-colors">
            StepFi
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className="relative px-4 py-2 text-sm
                  font-medium rounded-lg transition-all
                  duration-200 group"
                style={{
                  color: isActive ? '#22C55E' : '#A8BCCF',
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="absolute inset-0 rounded-lg
                  opacity-0 group-hover:opacity-100
                  transition-opacity"
                  style={{
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.15)',
                  }}
                />
                <span className="relative group-hover:text-brand
                  transition-colors">
                  {link.label}
                </span>
              </Link>
            )
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://stepfi.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2
              text-xs text-text-muted hover:text-brand
              transition-colors"
            aria-label="Landing page (opens in new tab)"
          >
            Landing <ExternalLink size={12} aria-hidden="true" />
          </a>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-xl text-xs
                font-mono text-text-secondary"
                style={{
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
                aria-label={`Connected wallet ${address.slice(0, 6)}...${address.slice(-4)}`}
              >
                <span className="w-1.5 h-1.5 rounded-full
                  bg-brand inline-block mr-1.5"
                  aria-hidden="true" />
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
                aria-label={`Disconnect wallet ${address.slice(0, 6)}...${address.slice(-4)}`}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await connectFreighter()
                } catch (err) {
                  alert(err instanceof Error ? err.message : 'Failed to connect')
                }
              }}
              aria-label="Connect Stellar wallet"
            >
              Connect Wallet
            </Button>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-text-secondary
            hover:text-text-primary transition-colors"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 py-4 flex flex-col gap-1"
          style={{
            background: 'rgba(8,15,26,0.98)',
            borderTop: '1px solid rgba(30,58,82,0.4)',
          }}>
          {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium"
              style={{
                color: pathname === link.href
                  ? '#22C55E' : '#A8BCCF',
              }}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 mt-2"
            style={{
              borderTop: '1px solid rgba(30,58,82,0.3)'
            }}>
            {isConnected ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={disconnectWallet}
              >
                Disconnect {address.slice(0, 6)}...
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={async () => {
                  try {
                    await connectFreighter()
                  } catch (err) {
                    alert(err instanceof Error ? err.message : 'Failed to connect')
                  }
                }}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
