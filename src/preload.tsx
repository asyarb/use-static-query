import * as React from 'react'
import ssrPrepass from 'react-ssr-prepass'
import { StaticCache, isPrepass } from './cache'
import { CacheProvider } from './context'

export async function preloadStaticCache(
  cache: StaticCache,
  node: React.ReactNode
): Promise<void> {
  if (typeof window !== 'undefined')
    throw new Error(
      'preloadCache must only be called during server-side rendering. Move your cache preloading to an SSR-only function.'
    )

  cache[isPrepass] = true
  await ssrPrepass(<CacheProvider cache={cache}>{node}</CacheProvider>)
  cache[isPrepass] = false
}
