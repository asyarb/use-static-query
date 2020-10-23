import { AppProps } from 'next/app'
import { hydrateQueryCache } from '../lib'

const App = ({ pageProps, Component }: AppProps) => {
  hydrateQueryCache(pageProps.queryCache)

  return <Component {...pageProps} />
}

export default App
