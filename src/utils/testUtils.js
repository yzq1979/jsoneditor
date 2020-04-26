import { deepStrictEqual, strictEqual, notStrictEqual, throws } from "assert"

// TODO: integrate jest or switch to mocha
// sort of mimicking jest
export function expect (actual) {
  return {
    toEqual (expected) {
      return deepStrictEqual(actual, expected)
    },

    toBe (expected) {
      return strictEqual(actual, expected)
    },

    toBeUndefined () {
      return strictEqual(actual, undefined)
    },

    toThrow (error) {
      return throws(actual, error)
    },

    not: {
      toBe (expected) {
        return notStrictEqual(actual, expected)
      }
    }
  }
}
