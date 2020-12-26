import * as React from 'react'
import { StaticCache } from './cache'

let cacheContext = React.createContext<StaticCache>(undefined!)
let { Provider: CacheContextProiver } = cacheContext

interface CacheProviderProps {
  children: React.ReactNode
  cache: StaticCache
}

export function CacheProvider({ cache, children }: CacheProviderProps) {
  return <CacheContextProiver value={cache}>{children}</CacheContextProiver>
}

export function useCache(): StaticCache {
  return React.useContext(cacheContext)
}
