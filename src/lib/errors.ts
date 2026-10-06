/**
 * API error → user-facing message mapping.
 *
 * One table keyed by a stable backend error code. The UI shows ONLY mapped,
 * safe text — a raw server message is never interpolated into `userMessage`
 * (server strings can carry internals like SQL fragments or stack hints). The
 * original error travels in `raw` for telemetry (hand it to `reportError`),
 * and must never be rendered to the DOM.
 *
 * Pure and side-effect free: it reads the error shape and returns a value.
 */

export interface ApiError {
  /** Stable code: a backend error code, or a derived `NETWORK` / `HTTP_<status>` / `UNKNOWN`. */
  code: string
  /** HTTP status, when the request reached the server. */
  status?: number
  /** Safe, human text to show the user. Never contains the raw server message in production. */
  userMessage: string
  /** Whether retrying the same request could plausibly succeed. */
  retryable: boolean
  /** The original error — for telemetry only (`reportError`); never render this. */
  raw?: unknown
}

/**
 * Frozen code → message table. Unknown codes fall back to `DEFAULT`.
 * Codes are opaque strings owned by the backend; add entries as the API grows.
 */
export const ERROR_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  INSUFFICIENT_LIQUIDITY: 'Not enough liquidity in the pool for this amount.',
  INSUFFICIENT_SHARES: "You don't have that many shares.",
  ROLE_ALREADY_SET: "Your role is already set and can't be changed.",
  UNAUTHENTICATED: 'Your session expired. Please reconnect your wallet.',
  VALIDATION: 'Please check the amounts you entered.',
  NETWORK: 'Network error. Check your connection and try again.',
  DEFAULT: 'Something went wrong. Please try again.',
})

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/**
 * Dev-only switch to append the raw server message for debugging. Reads the
 * build-time `VITE_SHOW_RAW_ERRORS` env (string `'true'`); defaults off and is
 * never a user-controlled value. Must never be `'true'` in a production build.
 */
function defaultShowRaw(): boolean {
  return import.meta.env?.VITE_SHOW_RAW_ERRORS === 'true'
}

/**
 * Normalize any thrown value (AxiosError, plain Error, or unknown) into a safe
 * {@link ApiError}. See the module header for the guarantees.
 *
 * @param err  the caught value
 * @param opts `showRaw` overrides the env default (used by callers/tests)
 */
export function mapApiError(err: unknown, opts?: { showRaw?: boolean }): ApiError {
  const showRaw = opts?.showRaw ?? defaultShowRaw()
  const record = asRecord(err)
  const response = asRecord(record?.response)

  let code: string
  let status: number | undefined

  if (response) {
    // the request reached the server and came back with a status
    status = typeof response.status === 'number' ? response.status : undefined
    const data = asRecord(response.data)
    code =
      readString(data?.errorCode) ??
      readString(data?.code) ??
      (status !== undefined ? `HTTP_${status}` : 'UNKNOWN')
  } else if (record && (record.isAxiosError === true || 'request' in record)) {
    // an axios error carrying a request but no response = the call never completed
    code = 'NETWORK'
  } else {
    // a plain Error or any non-request-shaped value
    code = 'UNKNOWN'
  }

  const retryable = code === 'NETWORK' || (status !== undefined && status >= 500 && status < 600)

  let userMessage = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.DEFAULT

  if (showRaw) {
    const rawMessage = readString(asRecord(response?.data)?.message) ?? readString(record?.message)
    if (rawMessage) userMessage = `${userMessage} [${rawMessage}]`
  }

  return { code, status, userMessage, retryable, raw: err }
}
