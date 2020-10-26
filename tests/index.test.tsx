import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import { useStaticQuery, StaticCache, CacheProvider } from '../src'

test('preloading works', async () => {
  let fetchData = async () => 'data'
  let Component = () => {
    let data = useStaticQuery(fetchData, 'key')

    return <div>{data}</div>
  }

  let cache = new StaticCache()
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
    let data = useStaticQuery(fetchData(value), 'currying')

    return <div>{data}</div>
  }

  let cache = new StaticCache()
  let ssrValue = 'some-data'
  await cache.preload(<Component value={ssrValue} />)

  let { getByText } = render(
    <CacheProvider cache={cache}>
      <Component value={ssrValue} />
    </CacheProvider>
  )

  expect(getByText(ssrValue)).toBeInTheDocument()
})
