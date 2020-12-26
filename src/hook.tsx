import { CacheKey } from './cache'
import { useCache } from './context'

export function useStaticQuery<T>(
  promiseFn: () => Promise<T>,
  cacheKey: CacheKey
): T {
  let cache = useCache()
  let hasCachedValue = cache.has(cacheKey)
  let isPrepass = cache.isPrepass()

  if (isPrepass && !hasCachedValue) {
    if (!cache.isPromiseFnRunning(cacheKey))
      cache.startPromiseFn(cacheKey, promiseFn)

    const concurrentPromiseFn = cache.getConcurrentPromiseFn(cacheKey)

    if (concurrentPromiseFn) throw concurrentPromiseFn
  }

  if (!hasCachedValue)
    throw new Error(
      `The useStaticQuery cache does not contain a cached value for key "${cacheKey}". If this is unexpected, verify CacheProvider is present at the root of your application with a populated cache. Otherwise, remove all instances of useStaticQuery with the key "${cacheKey}".`
    )

  return cache.get(cacheKey) as T
}
