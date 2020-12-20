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
  let hasCachedValue = cache.has(cacheKey)

  let shouldFetchServerSide = !hasCachedValue && typeof window === 'undefined'
  let shouldFetchClientSide = !hasCachedValue && !disableRuntime

  if (shouldFetchServerSide || shouldFetchClientSide) {
    if (!cache.isPromiseFnRunning(cacheKey))
      cache.startPromiseFn(cacheKey, promiseFn)

    const concurrentPromiseFn = cache.getConcurrentPromiseFn(cacheKey)

    if (concurrentPromiseFn) throw concurrentPromiseFn
  }

  return cache.get(cacheKey) as T
}
