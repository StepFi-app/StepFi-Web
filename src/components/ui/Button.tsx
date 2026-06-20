import type { ReactNode } from 'react'
import { clsx } from 'clsx'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit'
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  className,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-disabled={disabled || loading || undefined}
      className={clsx(
        'inline-flex items-center justify-center gap-2',
        'font-semibold rounded-xl transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2',
        {
          'bg-brand text-bg hover:opacity-90 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]':
            variant === 'primary',
          'bg-surface text-text-primary border border-border hover:border-brand/40':
            variant === 'secondary',
          'border border-brand text-brand hover:bg-brand/10':
            variant === 'outline',
          'text-text-secondary hover:text-text-primary':
            variant === 'ghost',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-5 py-2.5 text-sm': size === 'md',
          'px-7 py-3.5 text-base': size === 'lg',
        },
        className
      )}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current
            border-t-transparent rounded-full animate-spin"
            aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : children}
    </button>
  )
}
