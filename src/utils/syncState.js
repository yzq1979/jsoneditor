import {
  DEFAULT_LIMIT,
  STATE_EXPANDED,
  STATE_LIMIT,
  STATE_PROPS
} from '../constants.js'
import { isObject, isObjectOrArray } from './typeUtils.js'
import { updateProps } from './updateProps.js'

/**
 * @param {JSON} document
 * @param {JSON | undefined} state
 * @param {Path} path
 * @param {function (path: Path) : boolean} expand
 * @returns {JSON | undefined}
 */
export function syncState (document, state = undefined, path, expand) {
  if (isObject(document)) {
    const updatedState = {}

    updatedState[STATE_PROPS] = updateProps(document, state && state[STATE_PROPS])
    updatedState[STATE_EXPANDED] = state
      ? state[STATE_EXPANDED]
      : expand(path)

    if (updatedState[STATE_EXPANDED]) {
      Object.keys(document).forEach(key => {
        const childDocument = document[key]
        if (isObjectOrArray(childDocument)) {
          const childState = state && state[key]
          updatedState[key] = syncState(childDocument, childState, path.concat(key), expand)
        }
      })
    }

    return updatedState
  }

  if (Array.isArray(document)) {
    const updatedState = []

    // TODO: can we make the state for array a regular object { limit: 100, items: [...] }?

    updatedState[STATE_LIMIT] = state
      ? state[STATE_LIMIT]
      : DEFAULT_LIMIT

    updatedState[STATE_EXPANDED] = state
      ? state[STATE_EXPANDED]
      : expand(path)

    if (updatedState[STATE_EXPANDED]) {
      for (let i = 0; i < Math.min(document.length, updatedState[STATE_LIMIT]); i++) {
        const childDocument = document[i]
        if (isObjectOrArray(childDocument)) {
          const childState = state && state[i]
          updatedState[i] = syncState(childDocument, childState, path.concat(i), expand)
        }
      }
    }

    return updatedState
  }

  // primitive values have no state
  return undefined
}
