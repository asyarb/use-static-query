import { Foo } from '../components/Foo'
import { CacheProvider, QueryCache } from '../lib'

let HomePage = () => {
  return <Foo />
}

export default HomePage

export let getStaticProps = async () => {
  const cache = new QueryCache()
  await cache.preload(
    <CacheProvider cache={cache}>
      <HomePage />
    </CacheProvider>
  )

  return {
    props: {
      cache: cache.serialize(),
    },
  }
}
