import {
  compareStrings,
  duplicateInText,
  findUniqueName,
  toCapital
} from './stringUtils.js'
import { expect } from './testUtils.js' // FIXME: replace jest with mocha tests, or move to jest

const test = it // TODO: replace jest with mocha tests, or move to jest

test('findUniqueName', () => {
  expect(findUniqueName('other', {'a': true, 'b': true, 'c': true})).toEqual('other')
  expect(findUniqueName('b', {'a': true, 'b': true, 'c': true})).toEqual('b (copy)')
  expect(findUniqueName('b', {'a': true, 'b': true, 'c': true, 'b (copy)': true})).toEqual('b (copy 2)')
  expect(findUniqueName('b', {'a': true, 'b': true, 'c': true, 'b (copy)': true, 'b (copy 2)': true})).toEqual('b (copy 3)')
})

test('toCapital', () => {
  expect(toCapital('hello')).toEqual('Hello')
  expect(toCapital('HEllo')).toEqual('Hello')
  expect(toCapital('HEllo')).toEqual('Hello')
  expect(toCapital('')).toEqual('')
  expect(toCapital(undefined)).toEqual(undefined)
})

test('compareStrings', () => {
  expect(compareStrings('a', 'b')).toEqual(-1)
  expect(compareStrings('b', 'a')).toEqual(1)
  expect(compareStrings('a', 'a')).toEqual(0)

  const array = ['b', 'c', 'a']
  expect(array.sort(compareStrings)).toEqual(['a', 'b', 'c'])
})

test('duplicateInText', () => {
  expect(duplicateInText('abcdef', 2, 4)).toEqual('abcdcdef')
  expect(duplicateInText('abcdef', 4, 2)).toEqual('abcdcdef')
})
