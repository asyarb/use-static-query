export type CacheKey = string | number
type Cache = Record<CacheKey, unknown>

export const isPrepass = Symbol()

export class StaticCache {
  static fromSerializedCache(serializedCache?: string): StaticCache {
    if (!serializedCache)
      throw new Error(
        'Unable to de-serialize a valid cache. If this is unexpected, check to ensure you are setting up your cache at SSR-time.'
      )

    return new StaticCache(JSON.parse(serializedCache))
  }

  [isPrepass] = false
  private concurrentPromises: Record<CacheKey, Promise<unknown>> = {}

  constructor(private cache: Cache = {}) {}

  serialize(): string {
    return JSON.stringify(this.cache)
  }

  get<T>(key: CacheKey): T | undefined {
    return this.cache[key] as T | undefined
  }

  set<T>(key: CacheKey, value: T): void {
    this.cache[key] = value
  }

  has(key: CacheKey): boolean {
    return this.cache.hasOwnProperty(key)
  }

  isPrepass(): boolean {
    return this[isPrepass]
  }

  startPromiseFn<T>(cacheKey: CacheKey, promiseFn: () => Promise<T>): void {
    if (this.isPromiseFnRunning(cacheKey)) return

    this.concurrentPromises[cacheKey] = new Promise<T>(async (res) => {
      // Get the async return value of the provided function.
      const value = await promiseFn()

      // Set the resolved value to the serializable global cache.
      this.set(cacheKey, value)

      // Remove this Promise from the concurrent Promises store, effectively
      // stating we can stop suspending the render function.
      delete this.concurrentPromises[cacheKey]

      res(value)
    })
  }

  getConcurrentPromiseFn<T>(cacheKey: CacheKey): Promise<T> | undefined {
    return this.concurrentPromises[cacheKey] as Promise<T> | undefined
  }

  isPromiseFnRunning(cacheKey: CacheKey): boolean {
    return this.concurrentPromises.hasOwnProperty(cacheKey)
  }
}
