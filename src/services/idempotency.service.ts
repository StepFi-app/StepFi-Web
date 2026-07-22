import type { TransactionType } from '../types'

interface IdempotencyRecord {
  idempotencyKey: string
  xdrHash: string
  transactionHash: string
  type: TransactionType
  createdAt: string // ISO 8601
}

const STORAGE_KEY = 'stepfi-idempotency'
const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function getRecords(): IdempotencyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is IdempotencyRecord =>
        typeof r === 'object' &&
        r !== null &&
        typeof (r as IdempotencyRecord).idempotencyKey === 'string' &&
        typeof (r as IdempotencyRecord).xdrHash === 'string' &&
        typeof (r as IdempotencyRecord).transactionHash === 'string' &&
        typeof (r as IdempotencyRecord).type === 'string' &&
        typeof (r as IdempotencyRecord).createdAt === 'string'
    )
  } catch {
    return []
  }
}

function saveRecords(records: IdempotencyRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // localStorage full or unavailable — silently drop
  }
}

function pruneExpired(records: IdempotencyRecord[]): IdempotencyRecord[] {
  const now = Date.now()
  return records.filter((r) => {
    const createdAt = new Date(r.createdAt).getTime()
    return now - createdAt < TTL_MS
  })
}

async function hashXdr(xdr: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(xdr)

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  throw new Error('Web Crypto API not available for XDR hashing.')
}

export const idempotencyService = {
  /** Generate a UUID v4 idempotency key. */
  generateKey(): string {
    return crypto.randomUUID()
  },

  /**
   * Hash an XDR string for deduplication.
   * Returns a hex-encoded SHA-256 hash.
   */
  hashXdr,

  /**
   * Check if an XDR hash has already been submitted.
   * Returns the existing record or null.
   * Expired records (> 24 hours) are pruned before lookup.
   */
  findExisting(xdrHash: string): IdempotencyRecord | null {
    const records = pruneExpired(getRecords())
    // Persist the pruned list so expired entries don't accumulate
    saveRecords(records)
    return records.find((r) => r.xdrHash === xdrHash) ?? null
  },

  /**
   * Check if an idempotency key has already been submitted.
   * Returns the existing record or null.
   * Expired records are pruned before lookup.
   */
  findByKey(idempotencyKey: string): IdempotencyRecord | null {
    const records = pruneExpired(getRecords())
    saveRecords(records)
    return records.find((r) => r.idempotencyKey === idempotencyKey) ?? null
  },

  /**
   * Store a completed transaction record for future deduplication.
   */
  store(record: IdempotencyRecord): void {
    const records = pruneExpired(getRecords())
    records.push(record)
    saveRecords(records)
  },

  /**
   * Clear all idempotency records (for testing / manual reset).
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}
