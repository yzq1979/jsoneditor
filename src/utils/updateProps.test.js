import { createUpdateProps } from './updateProps.js'
import { expect } from './testUtils.js' // FIXME: replace jest with mocha tests, or move to jest

const test = it // TODO: replace jest with mocha tests, or move to jest

test('updateProps (1)', () => {
  const updateProps = createUpdateProps()

  expect(updateProps({b: 2}).map(item => item.key)).toEqual(['b'])

  const result2 = updateProps({a: 1, b: 2})
  expect(result2.map(item => item.key)).toEqual(['b', 'a'])
  expect(result2[0].id).toEqual('1')
})

test('updateProps (2)', () => {
  const updateProps = createUpdateProps()
  const result1 = updateProps({a: 1, b: 2})
  expect(updateProps({a: 1, b: 2})).toEqual(result1)
})
