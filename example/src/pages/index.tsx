import { Foo } from '../components/Foo'
import { serializeCache, fillQueryCache, createCache } from '../lib'

let HomePage = () => {
  return <Foo />
}

export default HomePage

export let getStaticProps = async () => {
  const queryCache = createCache()
  await fillQueryCache(<HomePage />)

  return {
    props: {
      queryCache: serializeCache(queryCache),
    },
  }
}
