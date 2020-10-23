import { AppProps } from 'next/app'
import { hydrateQueryCache, CacheProvider } from '../lib'

const App = ({ pageProps, Component }: AppProps) => {
  const queryCache = hydrateQueryCache(pageProps.queryCache)

  return (
    <CacheProvider queryCache={queryCache}>
      <Component {...pageProps} />
    </CacheProvider>
  )
}

export default App
