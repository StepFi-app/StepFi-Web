import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'
import { clsx } from 'clsx'
import { ToastContext } from './ToastContext'
import type { ToastType } from './ToastContext'

interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration?: number
}

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
}

const TOAST_ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      setToasts((prev) => [...prev, { id, type, message, duration }])

      window.setTimeout(() => {
        dismissToast(id)
      }, duration)
    },
    [dismissToast],
  )

  const toast = useMemo(
    () => ({
      success: (message: string, duration?: number) => addToast('success', message, duration),
      error: (message: string, duration?: number) => addToast('error', message, duration),
      warning: (message: string, duration?: number) => addToast('warning', message, duration),
      info: (message: string, duration?: number) => addToast('info', message, duration),
    }),
    [addToast],
  )

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3"
        aria-live="polite" aria-atomic="false"
      >
        {toasts.map((toastItem) => {
          const Icon = TOAST_ICONS[toastItem.type]

          return (
            <div
              key={toastItem.id}
              className={clsx(
                'flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-sm',
                TOAST_STYLES[toastItem.type],
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm font-medium leading-5">{toastItem.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toastItem.id)}
                className="rounded-full p-1 text-current/70 transition hover:bg-black/10 hover:text-current"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

