import { updateProps } from './updateProps.js'
import { expect } from './testUtils.js' // FIXME: replace jest with mocha tests, or move to jest

const test = it // TODO: replace jest with mocha tests, or move to jest

test('updateProps (1)', () => {
  const props1 = updateProps({b: 2})
  expect(props1.map(item => item.key)).toEqual(['b'])

  const props2 = updateProps({a: 1, b: 2}, props1)
  expect(props2.map(item => item.key)).toEqual(['b', 'a'])
})

test('updateProps (2)', () => {
  const props1 = updateProps({a: 1, b: 2})
  const props2 = updateProps({a: 1, b: 2}, props1)
  expect(props2).toEqual(props1)
})
