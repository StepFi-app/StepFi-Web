import type { ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl p-5',
        'border border-border bg-surface',
        hover && 'hover:border-brand/30 transition-colors',
        className
      )}
    >
      {children}
    </div>
  )
}
