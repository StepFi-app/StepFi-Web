import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Router } from './router'
import { ToastProvider } from './components/ui/Toast'
import './index.css'

if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, createRoot, 1000)
  })
}

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
)
