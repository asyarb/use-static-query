import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import {
  useStaticQuery,
  StaticCache,
  CacheProvider,
  preloadStaticCache,
} from '../src'

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(() => res(void 0), ms))
}

async function simulateSSR(f: () => unknown): Promise<void> {
  let windowSpy = jest.spyOn(window, 'window', 'get')

  // @ts-expect-error - Purposely not returning a Window
  windowSpy.mockImplementation(() => undefined)
  await f()
  windowSpy.mockRestore()
}

test('preloading works', async () => {
  let fetchData = async () => {
    await delay(100)
    return 'data'
  }
  let Component = () => {
    let data = useStaticQuery(fetchData, 'key')

    return <div>{data}</div>
  }
  let cache = new StaticCache()

  await simulateSSR(() => preloadStaticCache(cache, <Component />))

  let { getByText } = render(
    <CacheProvider cache={cache}>
      <Component />
    </CacheProvider>
  )

  expect(getByText('data')).toBeInTheDocument()
})

test('currying variables works', async () => {
  let fetchData = (value: string) => async () => {
    await delay(100)
    return value
  }
  let Component = ({ value }: { value: string }) => {
    let data = useStaticQuery(fetchData(value), 'currying')

    return <div>{data}</div>
  }
  let ssrValue = 'some-data'
  let cache = new StaticCache()

  await simulateSSR(() =>
    preloadStaticCache(cache, <Component value={ssrValue} />)
  )

  let { getByText } = render(
    <CacheProvider cache={cache}>
      <Component value={ssrValue} />
    </CacheProvider>
  )

  expect(getByText(ssrValue)).toBeInTheDocument()
})

test('can initialize with a serialized cache', async () => {
  let key = 'key'
  let serializedValue = 'value'
  let _cache = new StaticCache()
  _cache.set(key, serializedValue)
  let serializedCache = _cache.serialize()

  let fetchData = async () => {
    await delay(100)
    return `unserialized-${serializedValue}`
  }
  let Component = () => {
    let data = useStaticQuery(fetchData, key)

    return <div>{data}</div>
  }
  let cache = StaticCache.fromSerializedCache(serializedCache)

  await simulateSSR(() => preloadStaticCache(cache, <Component />))

  let { getByText } = render(
    <CacheProvider cache={cache}>
      <Component />
    </CacheProvider>
  )

  expect(getByText(serializedValue)).toBeInTheDocument()
})
