import * as React from 'react'
import { GetStaticProps } from 'next'
import { StaticCache } from './cache'

export type WithSerializedStaticCache<T> = T & {
  serializedStaticCache: ReturnType<StaticCache['serialize']>
}

export function withStaticCache<
  TProps extends Record<string, unknown>,
  TQueryParams extends Partial<Record<string, string | string[]>> = Partial<
    Record<string, string | string[]>
  >
>(
  Tree: React.ComponentType<TProps>,
  getStaticProps: GetStaticProps<TProps, TQueryParams>,
  cache = new StaticCache()
): GetStaticProps<WithSerializedStaticCache<TProps>, TQueryParams> {
  return async (...args) => {
    const result = await getStaticProps(...args)

    if ('props' in result) {
      const props = result.props

      await cache.preload(<Tree {...props} />)

      const serializedCache = cache.serialize()

      return {
        ...result,
        props: {
          ...result.props,
          serializedStaticCache: serializedCache,
        },
      }
    }

    return result
  }
}
