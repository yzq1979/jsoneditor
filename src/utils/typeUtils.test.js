import { getJSONNodeType } from './typeUtils.js'
import { expect } from './testUtils.js' // FIXME: replace jest with mocha tests, or move to jest

const test = it // TODO: replace jest with mocha tests, or move to jest

test('test getJsonType', () => {
  expect(getJSONNodeType([])).toEqual('array')
  expect(getJSONNodeType({})).toEqual('object')
  expect(getJSONNodeType(null)).toEqual('value')
  expect(getJSONNodeType(2)).toEqual('value')
  expect(getJSONNodeType('hello')).toEqual('value')
  expect(getJSONNodeType('hello')).toEqual('value')
})
