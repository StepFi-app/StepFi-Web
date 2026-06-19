import { useState } from 'react'
import { signTransaction } from '@stellar/freighter-api'
import { STELLAR_NETWORK } from '../constants/config'

interface UseTransactionReturn {
  isLoading: boolean
  error: string | null
  execute: <T>(
    getXdr: () => Promise<{ xdr: string }>,
    submit: (signedXdr: string) => Promise<T>
  ) => Promise<T>
}

export function useTransaction(): UseTransactionReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async <T>(
    getXdr: () => Promise<{ xdr: string }>,
    submit: (signedXdr: string) => Promise<T>
  ): Promise<T> => {
    setIsLoading(true)
    setError(null)
    try {
      const { xdr } = await getXdr()
      
      const networkPassphrase = (STELLAR_NETWORK as string) === 'PUBLIC'
        ? 'Public Global Stellar Network ; October 2015'
        : 'Test SDF Network ; September 2015'

      const signedResponse = await signTransaction(xdr, {
        networkPassphrase,
      })

      if (!signedResponse || signedResponse.error) {
        throw new Error(typeof signedResponse.error === 'string' ? signedResponse.error : 'User rejected the transaction')
      }
      
      const result = await submit(signedResponse.signedTxXdr)
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
