import { useState } from 'react'
import { signTransaction } from '@stellar/freighter-api'
import { STELLAR_NETWORK } from '../constants/config'
import type { UnsignedTransaction } from '../types'

interface UseTransactionReturn {
  isLoading: boolean
  error: string | null
  execute: <TPreview, TResult>(
    getXdr: () => Promise<UnsignedTransaction<TPreview>>,
    submit: (
      signedXdr: string,
      transaction: UnsignedTransaction<TPreview>
    ) => Promise<TResult>
  ) => Promise<TResult>
}

export function useTransaction(): UseTransactionReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async <TPreview, TResult>(
    getXdr: () => Promise<UnsignedTransaction<TPreview>>,
    submit: (
      signedXdr: string,
      transaction: UnsignedTransaction<TPreview>
    ) => Promise<TResult>
  ): Promise<TResult> => {
    setIsLoading(true)
    setError(null)
    try {
      // Backend returns { unsignedXdr, description, preview } (already
      // unwrapped from the { success, data, message } envelope by the service).
      const transaction = await getXdr()

      if (!transaction?.unsignedXdr) {
        throw new Error('Server did not return a transaction to sign.')
      }

      const networkPassphrase = (STELLAR_NETWORK as string) === 'PUBLIC'
        ? 'Public Global Stellar Network ; October 2015'
        : 'Test SDF Network ; September 2015'

      const signedResponse = await signTransaction(transaction.unsignedXdr, {
        networkPassphrase,
      })

      if (!signedResponse || signedResponse.error) {
        throw new Error(
          typeof signedResponse.error === 'string'
            ? signedResponse.error
            : 'User rejected the transaction'
        )
      }

      const result = await submit(signedResponse.signedTxXdr, transaction)
      return result
    } catch (err: unknown) {
      console.error('Transaction failed:', err)
      const message = err instanceof Error ? err.message : 'Transaction failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, error, execute }
}
