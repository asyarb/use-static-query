import { ReactNode, useContext, createContext } from 'react'
import ssrPrepass from 'react-ssr-prepass'

type CacheKey = string | number
type Cache = Record<CacheKey, unknown>

export function createCache() {
  return {} as Cache
}

export async function fillQueryCache(node: ReactNode): Promise<void> {
  await ssrPrepass(node)
}

export function serializeCache(cache: Record<CacheKey, unknown>): string {
  return JSON.stringify(cache)
}

export function hydrateQueryCache(serializedCache?: string): Cache {
  if (!serializedCache) return {}

  return JSON.parse(serializedCache)
}

const cacheContext = createContext({})

export function useStaticQuery<T>(
  promiseFn: () => Promise<T>,
  cacheKey: CacheKey
): T {
  const cache = useContext(cacheContext) as Cache
  const result = cache[cacheKey] as T

  // TODO: This is stupid hacky but it works. Maybe find alternative?
  if (!result) {
    promiseFn()
      .then((val) => (cache[cacheKey] = val))
      .catch(() => {})
  }

  return result
}
