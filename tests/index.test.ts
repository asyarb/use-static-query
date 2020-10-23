import { useStaticQuery } from '../src'
import * as assert from 'uvu/assert'
import { test } from 'uvu'

function delay(num: number = 500) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, num)
  })
}

test('it works', () => {
  const res = useStaticQuery(async () => {
    await delay(500)
    return 1
  }, 'hello')

  assert.is(res, null)
})

test.run()
