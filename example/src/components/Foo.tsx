import { useStaticQuery } from '../lib'

export const fetchPosts = async () => {
  return [
    { id: 1, title: 'Hello' },
    { id: 2, title: 'Hello' },
    { id: 3, title: 'Hello' },
    { id: 4, title: 'Hello' },
  ]
}

export const Foo = () => {
  const posts = useStaticQuery(fetchPosts, 'test')

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
