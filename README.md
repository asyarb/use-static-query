# Use Static Query <!-- omit in toc -->

A framework-agnostic data fetching hook and cache solution tailored for use
in static sites.

- [Installation](#installation)
- [Usage](#usage)
- [Motiviation](#motiviation)
  - [Is this like Gatsby's `useStaticQuery`?](#is-this-like-gatsbys-usestaticquery)
  - [Isn't this also like `useQuery`?](#isnt-this-also-like-usequery)
- [API](#api)
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

TODO

## License

MIT
