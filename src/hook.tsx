import { CacheKey } from './cache'
import { useCache } from './context'

export function useStaticQuery<T>(
  promiseFn: () => Promise<T>,
  cacheKey: CacheKey
): T {
  const cache = useCache()
  const result = cache.get(cacheKey) as T

  if (!result) {
    promiseFn()
      .then((val) => cache.set(cacheKey, val))
      .catch(() => {})
  }

  return result
}
