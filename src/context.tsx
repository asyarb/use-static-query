import React from 'react'
import { QueryCache } from './cache'

let cacheContext = React.createContext<QueryCache>(undefined!)
let { Provider: CacheContextProiver } = cacheContext

interface CacheProviderProps {
  children: React.ReactNode
  cache: QueryCache
}

export function CacheProvider({ cache, children }: CacheProviderProps) {
  return <CacheContextProiver value={cache}>{children}</CacheContextProiver>
}

export function useCache(): QueryCache {
  return React.useContext(cacheContext)
}
