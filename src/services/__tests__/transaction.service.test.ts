import { describe, expect, it, vi } from 'vitest'
import { TransactionService } from '../transaction.service'

const unsigned = { unsignedXdr: 'unsigned-xdr', description: 'Test', preview: { amount: 10 } }

function dependencies(overrides: Record<string, unknown> = {}) {
  return {
    getAdapter: () => ({ sign: vi.fn().mockResolvedValue('signed-xdr') }),
    submit: vi.fn().mockResolvedValue({ transactionHash: 'hash-1' }),
    getStatus: vi.fn().mockResolvedValue({ transactionHash: 'hash-1', status: 'confirmed' }),
    wait: vi.fn().mockResolvedValue(undefined),
    now: vi.fn().mockReturnValue(0),
    ...overrides,
  }
}

describe('TransactionService', () => {
  it('builds, signs, submits, and confirms a transaction', async () => {
    const service = new TransactionService(dependencies())
    const result = await service.execute({ build: vi.fn().mockResolvedValue(unsigned), type: 'deposit' })
    expect(result).toEqual({ ok: true, transactionHash: 'hash-1', preview: { amount: 10 } })
  })

  it('returns a rejected result when the wallet rejects signing', async () => {
    const service = new TransactionService(dependencies({
      getAdapter: () => ({ sign: vi.fn().mockRejectedValue(new Error('User rejected request')) }),
    }))
    const result = await service.execute({ build: vi.fn().mockResolvedValue(unsigned), type: 'deposit' })
    expect(result).toMatchObject({ ok: false, code: 'rejected' })
  })

  it('returns a timeout result when confirmation never resolves', async () => {
    let currentTime = 0
    const service = new TransactionService(dependencies({
      getStatus: vi.fn().mockResolvedValue({ transactionHash: 'hash-1', status: 'pending' }),
      wait: vi.fn().mockImplementation(() => { currentTime += 10 }),
      now: () => currentTime,
    }), { pollIntervalMs: 10, timeoutMs: 20 })
    const result = await service.execute({ build: vi.fn().mockResolvedValue(unsigned), type: 'deposit' })
    expect(result).toMatchObject({ ok: false, code: 'timeout', transactionHash: 'hash-1' })
  })
})
