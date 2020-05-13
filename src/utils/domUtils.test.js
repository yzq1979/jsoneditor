import { escapeHTML, unescapeHTML } from './domUtils.js'
import { expect } from './testUtils.js' // FIXME: replace jest with mocha tests, or move to jest

const test = it // TODO: replace jest with mocha tests, or move to jest

test('escapeHTML', () => {
  expect(escapeHTML('   hello  ')).toEqual('\u00A0\u00A0 hello \u00A0')
  expect(escapeHTML('\u00A0 hello')).toEqual('\u00A0 hello')
  expect(escapeHTML('hello\nworld')).toEqual('hello\\nworld')

  // TODO: test escapeHTML more thoroughly
})

test('unescapeHTML', () => {
  expect(unescapeHTML(' \u00A0 hello \u00A0')).toEqual('   hello  ')
  expect(unescapeHTML('\u00A0 hello')).toEqual('  hello')

  expect(unescapeHTML('hello\\nworld')).toEqual('hello\nworld')

  // TODO: test unescapeHTML more thoroughly
})
