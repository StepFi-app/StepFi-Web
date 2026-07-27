import { useCallback, useState } from 'react'
import { transactionService, type TransactionPhase, type TransactionResult } from '../services/transaction.service'
import type { TransactionType, UnsignedTransaction } from '../types'

export function useTransaction() {
  const [phase, setPhase] = useState<TransactionPhase | 'idle' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const execute = useCallback(async <TPreview>(build: () => Promise<UnsignedTransaction<TPreview>>, type: TransactionType): Promise<TransactionResult<TPreview>> => {
    setError(null)
    const result = await transactionService.execute({ build, type, onPhase: setPhase })
    if (!result.ok) { setPhase('error'); setError(result.message) }
    return result
  }, [])
  const reset = useCallback(() => { setPhase('idle'); setError(null) }, [])
  return { execute, reset, phase, error, isLoading: phase === 'pending' || phase === 'signing' || phase === 'submitted' }
}
