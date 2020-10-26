import { ReactNode } from 'react'
import ssrPrepass from 'react-ssr-prepass'

export type CacheKey = string | number
type Cache = Record<CacheKey, unknown>

export class QueryCache {
  static fromSerializedCache(serializedCache?: string): QueryCache {
    if (!serializedCache) return new QueryCache()

    return new QueryCache(JSON.parse(serializedCache))
  }

  private cache: Cache = {}

  constructor(initialCache?: Cache) {
    if (!initialCache) return

    this.cache = initialCache
  }

  async preload(node: ReactNode): Promise<void> {
    await ssrPrepass(node)
  }

  serialize(): string {
    return JSON.stringify(this.cache)
  }

  get<T>(key: CacheKey): T {
    return this.cache[key] as T
  }

  set<T>(key: CacheKey, value: T): void {
    this.cache[key] = value
  }
}
