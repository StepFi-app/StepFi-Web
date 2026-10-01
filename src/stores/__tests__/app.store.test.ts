import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useAppStore } from '../app.store'

/**
 * Installs a working in-memory `localStorage` for the duration of a test.
 *
 * jsdom provides no `localStorage` here, and Node 24+ shadows it with a
 * getter-only global accessor that resolves to `undefined` unless the process
 * was started with `--localstorage-file`. Two consequences:
 *   - `vi.stubGlobal` cannot replace it (assignment to an accessor with no
 *     setter is silently ignored), and
 *   - zustand reads `window.localStorage` specifically (see `persistImpl` in
 *     zustand/middleware), not `globalThis.localStorage`, so `window` must be
 *     patched too.
 */
function installMemoryStorage(): () => void {
  const makeStorage = () => {
    const store = new Map<string, string>()
    return {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, String(value)),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size
      },
    }
  }

  const targets: object[] = []
  const win = (globalThis as { window?: object }).window
  if (win) targets.push(win)
  targets.push(globalThis)

  const restores = targets.map((target) => {
    const original = Object.getOwnPropertyDescriptor(target, 'localStorage')
    Object.defineProperty(target, 'localStorage', {
      configurable: true,
      writable: true,
      value: makeStorage(),
    })
    return () => {
      if (original) {
        Object.defineProperty(target, 'localStorage', original)
      } else {
        Reflect.deleteProperty(target, 'localStorage')
      }
    }
  })

  return () => restores.forEach((restore) => restore())
}

describe('useAppStore session expiry signal', () => {
  let restoreStorage: () => void

  beforeEach(() => {
    restoreStorage = installMemoryStorage()
    useAppStore.getState().setSessionExpired(false)
  })

  afterEach(() => {
    restoreStorage()
  })

  it('starts without a pending session-expiry redirect', () => {
    expect(useAppStore.getState().sessionExpired).toBe(false)
  })

  it('setSessionExpired raises and clears the redirect signal', () => {
    useAppStore.getState().setSessionExpired(true)
    expect(useAppStore.getState().sessionExpired).toBe(true)

    useAppStore.getState().setSessionExpired(false)
    expect(useAppStore.getState().sessionExpired).toBe(false)
  })

  it('does not persist the transient redirect signal across reloads', () => {
    useAppStore.getState().setSessionExpired(true)

    // A pending redirect must not survive a reload, otherwise a later visit
    // would bounce the user straight back to the dashboard.
    const raw = localStorage.getItem('stepfi-app')
    const persisted = raw ? JSON.parse(raw) : { state: {} }
    expect(persisted.state).not.toHaveProperty('sessionExpired')
  })
})
