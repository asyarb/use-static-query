import { fetchPosts, Foo } from '../components/Foo'
import { prefetchQuery, cacheQueryData } from '../lib'

function HomePage() {
  return <Foo />
}

export default HomePage

export async function getStaticProps() {
  await prefetchQuery(fetchPosts, 'test')

  return {
    props: {
      queryCache: cacheQueryData(),
    },
  }
}
