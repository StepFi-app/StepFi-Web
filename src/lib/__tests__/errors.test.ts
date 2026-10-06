import { describe, it, expect } from 'vitest'
import { mapApiError, ERROR_MESSAGES } from '../errors'

describe('mapApiError', () => {
  it('reads a backend errorCode from the response envelope (acceptance #1)', () => {
    const result = mapApiError({ response: { status: 409, data: { errorCode: 'ROLE_ALREADY_SET' } } })
    expect(result).toEqual({
      code: 'ROLE_ALREADY_SET',
      status: 409,
      userMessage: ERROR_MESSAGES.ROLE_ALREADY_SET,
      retryable: false,
      raw: expect.anything(),
    })
  })

  it('falls back to data.code when errorCode is absent', () => {
    const result = mapApiError({ response: { status: 400, data: { code: 'VALIDATION' } } })
    expect(result.code).toBe('VALIDATION')
    expect(result.userMessage).toBe(ERROR_MESSAGES.VALIDATION)
  })

  it('resolves every entry in the message table', () => {
    for (const code of Object.keys(ERROR_MESSAGES)) {
      if (code === 'DEFAULT') continue
      const result = mapApiError({ response: { status: 400, data: { errorCode: code } } })
      expect(result.code).toBe(code)
      expect(result.userMessage).toBe(ERROR_MESSAGES[code])
    }
  })

  it('falls back to DEFAULT for an unknown code (never throws)', () => {
    const result = mapApiError({ response: { status: 418, data: { errorCode: 'A_BRAND_NEW_CODE' } } })
    expect(result.code).toBe('A_BRAND_NEW_CODE')
    expect(result.userMessage).toBe(ERROR_MESSAGES.DEFAULT)
  })

  it('derives HTTP_<status> codes when the body carries no code', () => {
    expect(mapApiError({ response: { status: 404, data: {} } }).code).toBe('HTTP_404')
    expect(mapApiError({ response: { status: 503, data: {} } }).code).toBe('HTTP_503')
  })

  it('maps a non-axios Error to UNKNOWN + DEFAULT (acceptance #2)', () => {
    const result = mapApiError(new Error('boom'))
    expect(result.code).toBe('UNKNOWN')
    expect(result.userMessage).toBe(ERROR_MESSAGES.DEFAULT)
    expect(result.retryable).toBe(false)
  })

  it('maps a response-less axios error to NETWORK, retryable (acceptance #3)', () => {
    expect(mapApiError({ isAxiosError: true, request: {}, message: 'Network Error' })).toMatchObject({
      code: 'NETWORK',
      retryable: true,
    })
    expect(mapApiError({ request: {} }).code).toBe('NETWORK')
  })

  it('sets retryable: true for NETWORK and 5xx, false for 4xx', () => {
    expect(mapApiError({ request: {} }).retryable).toBe(true)
    expect(mapApiError({ response: { status: 500, data: {} } }).retryable).toBe(true)
    expect(mapApiError({ response: { status: 502, data: {} } }).retryable).toBe(true)
    expect(mapApiError({ response: { status: 400, data: {} } }).retryable).toBe(false)
    expect(mapApiError({ response: { status: 409, data: { errorCode: 'ROLE_ALREADY_SET' } } }).retryable).toBe(false)
  })

  it('never surfaces the raw server message when showRaw is false (regression)', () => {
    const leak = 'ERROR: duplicate key value violates unique constraint "users_pkey"'
    const result = mapApiError(
      { response: { status: 409, data: { errorCode: 'ROLE_ALREADY_SET', message: leak } } },
      { showRaw: false },
    )
    expect(result.userMessage).toBe(ERROR_MESSAGES.ROLE_ALREADY_SET)
    expect(result.userMessage).not.toContain('constraint')
    expect(result.userMessage).not.toContain(leak)
  })

  it('appends the raw message only when showRaw is explicitly enabled (dev)', () => {
    const result = mapApiError(
      { response: { status: 400, data: { errorCode: 'VALIDATION', message: 'amount must be > 0' } } },
      { showRaw: true },
    )
    expect(result.userMessage).toContain(ERROR_MESSAGES.VALIDATION)
    expect(result.userMessage).toContain('amount must be > 0')
  })

  it('always carries the original error in raw for telemetry', () => {
    const original = new Error('for reportError')
    expect(mapApiError(original).raw).toBe(original)
  })

  it('tolerates null/undefined/string input without throwing', () => {
    expect(mapApiError(null).code).toBe('UNKNOWN')
    expect(mapApiError(undefined).code).toBe('UNKNOWN')
    expect(mapApiError('nope').code).toBe('UNKNOWN')
    expect(mapApiError(null).userMessage).toBe(ERROR_MESSAGES.DEFAULT)
  })
})
