import * as React from 'react'

// Safe shim for Emotion's insertion effect polyfill
// Falls back to useLayoutEffect in non-React 18 environments

type EffectCallback = () => void

// Emotion imports these exact names. Provide compatible fallbacks.
export function useInsertionEffectWithLayoutFallback(callback: EffectCallback): void {
  const effect: (cb: EffectCallback) => void = (React as any).useInsertionEffect ?? React.useLayoutEffect
  effect(callback)
}

export function useInsertionEffectAlwaysWithSyncFallback(callback: EffectCallback): void {
  const effect: (cb: EffectCallback) => void = (React as any).useInsertionEffect ?? React.useLayoutEffect
  effect(callback)
}