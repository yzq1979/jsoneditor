import { getType } from './utils.js'
import assert from 'assert'

describe('utils', () => {
  it('should test equality of positive values', function () {
    assert.strictEqual(getType([]), 'array')
    assert.strictEqual(getType({}), 'object')
    assert.strictEqual(getType(null), 'value')
    assert.strictEqual(getType(2), 'value')
    assert.strictEqual(getType('hello'), 'value')
    assert.strictEqual(getType('hello'), 'value')
  })
})
