import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import { useCachedQuery, QueryCache, CacheProvider } from '../src'

test('preloading works', async () => {
  let fetchData = async () => 'data'
  let Component = () => {
    const data = useCachedQuery(fetchData, 'key')

    return <div>{data}</div>
  }

  let cache = new QueryCache()
  await cache.preload(<Component />)

  let { getByText } = render(
    <CacheProvider cache={cache}>
      <Component />
    </CacheProvider>
  )

  expect(getByText('data')).toBeInTheDocument()
})
