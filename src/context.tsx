import { createContext, useContext, ReactNode } from 'react'

import { QueryCache } from './cache'

let cacheContext = createContext<QueryCache>(undefined!)
let { Provider: CacheContextProiver } = cacheContext

interface CacheProviderProps {
  children: ReactNode
  cache: QueryCache
}

export function CacheProvider({ cache, children }: CacheProviderProps) {
  return <CacheContextProiver value={cache}>{children}</CacheContextProiver>
}

export function useCache(): QueryCache {
  return useContext(cacheContext)
}
