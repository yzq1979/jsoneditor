import {
  DEFAULT_LIMIT,
  STATE_EXPANDED,
  STATE_LIMIT,
  STATE_PROPS
} from '../constants.js'
import { syncState } from './syncState.js'
import { expect } from './testUtils.js' // FIXME: replace jest with mocha tests, or move to jest

const test = it // TODO: replace jest with mocha tests, or move to jest

test('syncState', () => {
  const document = {
    array: [1, 2, {c: 6}],
    object: {a: 4, b: 5},
    value: 'hello'
  }

  function expand (path) {
    return path.length <= 1
  }

  const state = syncState(document, undefined, [], expand)

  const expectedState = {}
  expectedState[STATE_EXPANDED] = true
  expectedState[STATE_PROPS] =  [
    { 'id': '1', 'key': 'array' },
    { 'id': '2', 'key': 'object' },
    { 'id': '3', 'key': 'value' }
  ]
  expectedState.array = []
  expectedState.array[STATE_EXPANDED] = true
  expectedState.array[STATE_LIMIT] = DEFAULT_LIMIT
  expectedState.array[2] = {}
  expectedState.array[2][STATE_EXPANDED] = false
  expectedState.array[2][STATE_PROPS] = [
    { 'id': '4', 'key': 'c' } // FIXME: props should not be created because node is not expande
  ]
  expectedState.object = {}
  expectedState.object[STATE_EXPANDED] = true
  expectedState.object[STATE_PROPS] =  [
    { 'id': '5', 'key': 'a' },
    { 'id': '6', 'key': 'b' }
  ]

  expect(state).toEqual(expectedState)
})

// TODO: write more unit tests for syncState

