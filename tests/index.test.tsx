import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import { useCachedQuery, QueryCache, CacheProvider } from '../src'

test('preloading works', async () => {
  let fetchData = async () => 'data'
  let Component = () => {
    let data = useCachedQuery(fetchData, 'key')

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

test('currying variables works', async () => {
  let fetchData = (value: string) => async () => value
  let Component = ({ value }: { value: string }) => {
    let data = useCachedQuery(fetchData(value), 'currying')

    return <div>{data}</div>
  }

  let cache = new QueryCache()
  let ssrValue = 'some-data'
  await cache.preload(<Component value={ssrValue} />)

  let { getByText } = render(
    <CacheProvider cache={cache}>
      <Component value={ssrValue} />
    </CacheProvider>
  )

  expect(getByText(ssrValue)).toBeInTheDocument()
})
