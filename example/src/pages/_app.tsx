import { AppProps } from 'next/app'
import { CacheProvider, QueryCache } from '../lib'

const App = ({ pageProps, Component }: AppProps) => {
  const cache = QueryCache.fromSerializedCache(pageProps.cache)

  return (
    <CacheProvider cache={cache}>
      <Component {...pageProps} />
    </CacheProvider>
  )
}

export default App
