import { useEffect, useReducer } from 'react'

type CacheKey = string | number

let cache: Record<CacheKey, unknown> = {}

export function cacheQueryData() {
  return JSON.stringify(cache)
}

export function hydrateQueryCache(serializedCache?: string) {
  if (!serializedCache) return {}

  cache = JSON.parse(serializedCache)
}

export async function prefetchQuery<T>(
  promiseFn: () => Promise<T>,
  cacheKey: CacheKey
): Promise<void> {
  let entry = cache[cacheKey]
  if (entry) return

  let value = await promiseFn()
  if (!value) return // maybe throw?

  cache[cacheKey] = value
}

export function useStaticQuery<T>(
  promiseFn: () => Promise<T>,
  cacheKey: CacheKey
) {
  const [, rerender] = useReducer((val) => !!val, false)
  const result = cache[cacheKey] as T

  useEffect(() => {
    if (result) return

    promiseFn()
      .then((val) => (cache[cacheKey] = val))
      .catch(() => {})

    rerender()
  }, [])

  return result
}
