import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t mt-20"
      style={{ borderColor: 'rgba(30,58,82,0.4)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8
        flex flex-col md:flex-row items-center
        justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg width="24" height="20" viewBox="0 0 28 24" aria-hidden="true">
            <rect x="0" y="18" width="6" height="6"
              rx="1.5" fill="#1D4ED8"/>
            <rect x="8" y="12" width="6" height="12"
              rx="1.5" fill="#2563EB"/>
            <rect x="16" y="6" width="6" height="18"
              rx="1.5" fill="#4ADE80"/>
            <rect x="22" y="0" width="6" height="24"
              rx="1.5" fill="#22C55E"/>
          </svg>
          <span className="font-display font-bold text-text-primary">
            StepFi
          </span>
          <span className="text-text-muted text-sm">
            © 2026 · MIT License · Built for Stellar
          </span>
        </div>
        <nav aria-label="Footer navigation">
          <div className="flex items-center gap-6 text-sm
            text-text-muted">
            <a href="https://github.com/StepFi-app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand transition-colors"
              aria-label="GitHub (opens in new tab)">
              GitHub
            </a>
            <a href="https://stepfi.vercel.app/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand transition-colors"
              aria-label="Documentation (opens in new tab)">
              Docs
            </a>
            <Link to="/contracts"
              className="hover:text-brand transition-colors">
              Contracts
            </Link>
            <a href="https://contribute.grantfox.xyz/org/StepFi-app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand transition-colors"
              aria-label="Grantfox (opens in new tab)">
              Grantfox
            </a>
          </div>
        </nav>
      </div>
    </footer>
  )
}
