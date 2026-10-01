import '@testing-library/jest-dom'

/**
 * Provide `localStorage` for the test environment.
 *
 * jsdom under this Node version leaves `window.localStorage` undefined, and
 * Node 24+ shadows the global with a getter-only accessor that resolves to
 * `undefined` unless the process was started with `--localstorage-file`. Two
 * consequences that break tests before they can assert anything:
 *   - `vi.stubGlobal('localStorage', ...)` cannot replace it, because assigning
 *     to an accessor with no setter is silently ignored; and
 *   - zustand's persist middleware reads `window.localStorage` once, at module
 *     load (`createJSONStorage(() => window.localStorage)` in
 *     zustand/middleware), and keeps that reference forever.
 *
 * So the polyfill has to be installed here — in the setup file, which runs
 * before any test module is imported — rather than per test.
 */
function installLocalStoragePolyfill(): void {
  const store = new Map<string, string>()
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value))
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  }

  for (const target of [window, globalThis] as object[]) {
    Object.defineProperty(target, 'localStorage', {
      configurable: true,
      writable: true,
      value: storage,
    })
  }
}

if (typeof window !== 'undefined' && !window.localStorage) {
  installLocalStoragePolyfill()
}
