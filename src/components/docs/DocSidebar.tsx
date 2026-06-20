import { clsx } from 'clsx'
import { DOC_SECTIONS } from './DocSections'

interface DocSidebarProps {
  activeSlug: string
  onNavigate: (slug: string) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function DocSidebar({ activeSlug, onNavigate, mobileOpen, onMobileClose }: DocSidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed lg:sticky top-20 lg:top-20 z-40 lg:z-0 h-[calc(100vh-5rem)]',
          'w-64 shrink-0 border-r border-border bg-bg overflow-y-auto',
          'transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Documentation sidebar"
      >
        <nav className="p-4 space-y-1">
          {DOC_SECTIONS.map((section) => {
            const Icon = section.icon
            const isActive = activeSlug === section.slug
            return (
              <button
                key={section.slug}
                onClick={() => {
                  onNavigate(section.slug)
                  onMobileClose()
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                  isActive
                    ? 'bg-brand/10 text-brand border border-brand/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} />
                {section.title}
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
