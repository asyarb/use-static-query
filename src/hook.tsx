import { CacheKey } from './cache'
import { useCache } from './context'

interface Options {
  disableRuntime?: boolean
}

export function useStaticQuery<T>(
  promiseFn: () => Promise<T>,
  cacheKey: CacheKey,
  { disableRuntime = true }: Options = {}
): T {
  let cache = useCache()
  let result = cache.get<T>(cacheKey)

  let shouldFetchServerSide = !result && typeof window === 'undefined'
  let shouldFetchClientSide = !disableRuntime && !result

  if (shouldFetchServerSide || shouldFetchClientSide) {
    promiseFn()
      .then((val) => cache.set(cacheKey, val))
      .catch(() => {})
  }

  return result as T
}
