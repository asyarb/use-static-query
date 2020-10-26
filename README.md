# Use Static Query <!-- omit in toc -->

A framework-agnostic data fetching hook and cache solution tailored for use
in static sites.

- [Installation](#installation)
- [Usage](#usage)
- [Motiviation](#motiviation)
  - [Is this like Gatsby's `useStaticQuery`?](#is-this-like-gatsbys-usestaticquery)
  - [Isn't this also like `useQuery`?](#isnt-this-also-like-usequery)
- [API](#api)
  - [`useStaticQuery()`](#usestaticquery)
    - [Arguments](#arguments)
  - [`<CacheProvider>`](#cacheprovider)
    - [Options](#options)
  - [`StaticCache`](#staticcache)
  - [`staticCache.preload`](#staticcachepreload)
    - [Arguments](#arguments-1)
  - [`staticCache.serialize`](#staticcacheserialize)
  - [`staticCache.get`](#staticcacheget)
    - [Options](#options-1)
    - [Returns](#returns)
  - [`staticCache.set`](#staticcacheset)
    - [Options](#options-2)
  - [`StaticCache.fromSerializedCache`](#staticcachefromserializedcache)
    - [Options](#options-3)
    - [Returns](#returns-1)
- [License](#license)

## Installation

```bash
# npm
npm i @asyarb/use-static-query

# yarn
yarn add @asyarb/use-static-query
```

## Usage

The example below uses NextJS, but it can be adapted to be used in any rendering
context.

```jsx
// components/Example.js
import { useStaticQuery } from '@asyarb/use-static-query'

// Any API request that happens at build-time.
async function fetchPosts() {
  return [{ id: 1, text: 'text' }]
}

let Example = ({ pageId }) => {
  //                        ↓ Function that returns a Promise.
  let posts = useStaticQuery(fetchPosts, 'posts')
  //                                     ↑ Cache key.

  return (
    <div>
      {posts.map((p) => (
        <Post key={p.id}>{p.text}</Post>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------
// pages/index.js
import { StaticCache } from '@asyarb/use-static-query'

let IndexPage = () => {
  return (
    <div>
      <Posts />
    </div>
  )
}

export default IndexPage

export async function getStaticProps() {
  // At build time, we'll traverse our component tree
  // and fill our cache with the results of our static queries.
  let cache = new StaticCache()
  await cache.preload(<IndexPage />)

  return {
    props: {
      // Here, we serialize our cache and sent it client-side.
      serializedCache: cache.serialize(),
    },
  }
}

// ---------------------------------------------------------------------
// pages/_app.js
import { StaticCache, CacheProvider } from '@asyarb/use-static-query'

let App = ({ pageProps, Component }) => {
  // At run-time, read the cache we serialized in `getStaticProps` and
  // hydrate it into our provider. This will feed the statically cached
  // data to our components at runtime.
  let cache = StaticCache.fromSerializedCache(pageProps.serializedCache)

  return (
    <CacheProvider cache={cache}>
      <Component {...pageProps} />
    </CacheProvider>
  )
}
```

If you need to pass variables to a `useStaticQuery` function at build-time, consider using function composition:

```jsx
// components/Example.js
import { useStaticQuery } from '@asyarb/use-static-query'

let fetchRelatedPosts = (pageId) => async () => {
  // use `pageId` here as needed:
  return Posts.findRelated(pageId)
}

let Example = ({ pageId }) => {
  let posts = useStaticQuery(
    fetchRelatedPosts(pageId),
    `relatedPosts-${pageId}` // Use a cache-key with the variable:
  )

  return (
    <div>
      {posts.map((p) => (
        <Post key={p.id}>{p.text}</Post>
      ))}
    </div>
  )
}
```

## Motiviation

A lot of React-based static site generators provide APIs to source data into
pages at build-time, but often require you to orchestrate your data fetching
in a central location (e.g. NextJS's `getStaticProps`).

In simple cases this works, but this can get quickly out of hand when you
need to pass your data down through several layers of components. Instead,
this package allows developers to declare their data dependencies from the
bottom up, similar to how they would in a typical React app.

### Is this like Gatsby's `useStaticQuery`?

If you've used Gatby's `useStaticQuery` hook before, this hook is similar but
has key differences:

- Not tied to GraphQL.
- Can have more than one instance of the hook in a file.
- Not reliant on compile-time juju.
- Allows for the use of variables via closures.

### Isn't this also like `useQuery`?

Yes! The API was primarily inspired by React Query, but was tailored down for
use in SSG. Technically, you could use React Query in a very similar way with
their latest `hydration` APIs, but this package provides a few niceities in
comparison:

- No need to explicitly run `prefetchQuery` to get your data into your cache.
- No need to prevent refetching at runtime if that isn't what you want.
- Smaller bundle size, due to not having to support as many features.

If you're writing an app that _does_ have runtime reads & writes,
you should definitely choose a solution like React Query instead of this.

## API

### `useStaticQuery()`

A React hook for fetching and reading static data. At build-time, this hook
will populate a cache with data. At run-time, this hook will only read data
from cache unless the `disableRuntime` option is set to `false`.

```tsx
function useStaticQuery<T>(
  promiseFn: () => Promise<T>,
  cacheKey: string | number,
  { disableRuntime = true }?: { disableRuntime?: boolean }
): T
```

#### Arguments

- `promiseFn: () => Promise<T>`
  - **Required**
  - The function that the query will use to fetch data at build-time.
  - Must return a promise that will resolve data.
  - Errors will be thrown as received. (You probably don't want to build your
    site if data-fetching failed somewhere.)
- `cacheKey: string | number`
  - **Required**
  - The cache key to use for this query.
  - If you plan on using variables via composition, your `cacheKey` should
    contain your variable in some capacity.
- `Options`
  - **Default:** `true`
  - `disableRuntime` if set to `false`, the hook will attempt to perform a
    query at **run-time** if there is no cached data available for the provided
    `cacheKey`. If set to `true`, the hook will **only** read from the cache at
    run-time. In most SSG contexts, you want this to be `true`.

### `<CacheProvider>`

The React context provider that should be wrapped around the root component
of your app. Provides access to the cache to callers of
`useStaticQuery`.

#### Options

- `cache: StaticCache`
  - **Required**
  - Instance of `StaticCache`.
- `children: React.ReactNode`

### `StaticCache`

`StaticCache` is the primary mechanism that manages all of the data of static queries. If needed, a cache object and its data can be accessed via a typical `get()` and `set()` pattern as well.

An instance of `StaticCache` has the following properties and methods:

- [`preload(node: React.ReactNode)`](#staticcachepreload)
- [`serialize()`](#staticcacheserialize)
- [`get(key: string | number)`](#staticcacheget)
- [`set(key: string | number, value: T)`](#staticcacheset)

`StaticCache` also has the following static methods available:

- [`fromSerializedCache(serializedCache?: string)`](#staticcachefromserializedcache)

### `staticCache.preload`

`preload` is an async method to traverse a React component tree and fill the `StaticCache` instance with the resulting data from the `useStaticQuery` hooks.

This function should only be called at build-time or in a server-side
context.

```jsx
let cache = new StaticCache()
await cache.preload(<Page />)
```

#### Arguments

- `node: React.ReactNode`
  - **Required**
  - The React component tree to traverse and fill the cache with.

### `staticCache.serialize`

`serialize` is a function to serialize a `StaticCache` object to be sent to a client-side runtime.

```jsx
let cache = new StaticCache()
let serializedCache = cache.serialize()
```

### `staticCache.get`

A function to read cached values at a provided `cacheKey`. Use this to read
values from your cache imperatively.

```jsx
let posts = cache.get('posts')
```

#### Options

- `key: string | number`
  - **Required**
  - The key to lookup in the cache.

#### Returns

- The value at the provided `key` or `undefined`.

### `staticCache.set`

A function to write `value` to the cache at the provided `cacheKey`. Use this to write
values from your cache imperatively.

```jsx
cache.set('posts', [{ id: 1, text: 'text' }])
```

#### Options

- `key: string | number`
  - **Required**
  - The key to write to the cache.
- `value: T`
  - **Required**
  - The value to write to the cache.

### `StaticCache.fromSerializedCache`

`fromSerializedCache` is a static method on `StaticCache` that is used to instantiate a new `StaticCache` instance from a serialized instance made via `staticCache.serialize()`. This is typically ran at runtime to rehydrate your app with your build-time cache.

```jsx
let cache = StaticCache.fromSerializedCache(pageProps.serializedCache)
```

#### Options

- `serializedCache: string `
  - **Required**
  - The serialized cache to attempt to hydrate from.

#### Returns

An instance of `StaticCache` whose data reflects the serialized cache it was instantiated from.

## License

MIT
