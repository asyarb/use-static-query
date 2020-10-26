import * as React from 'react'
import ssrPrepass from 'react-ssr-prepass'

import { CacheProvider } from './context'

export type CacheKey = string | number
type Cache = Record<CacheKey, unknown>

export class StaticCache {
  static fromSerializedCache(serializedCache?: string): StaticCache {
    if (!serializedCache) return new StaticCache()

    return new StaticCache(JSON.parse(serializedCache))
  }

  private cache: Cache = {}

  constructor(initialCache?: Cache) {
    if (!initialCache) return

    this.cache = initialCache
  }

  async preload(node: React.ReactNode): Promise<void> {
    await ssrPrepass(<CacheProvider cache={this}>{node}</CacheProvider>)
  }

  serialize(): string {
    return JSON.stringify(this.cache)
  }

  get<T>(key: CacheKey): T | undefined {
    return this.cache[key] as T | undefined
  }

  set<T>(key: CacheKey, value: T): void {
    this.cache[key] = value
  }
}
