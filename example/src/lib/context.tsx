import { createContext, useContext, ReactNode } from 'react'

import { QueryCache } from './cache'

const cacheContext = createContext(new QueryCache())
const { Provider: CacheContextProiver } = cacheContext

interface CacheProviderProps {
  children: ReactNode
  cache: QueryCache
}

export function CacheProvider({ cache, children }: CacheProviderProps) {
  return <CacheContextProiver value={cache}>{children}</CacheContextProiver>
}

export function useCache() {
  return useContext(cacheContext)
}
