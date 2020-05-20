import { valueType } from './utils/typeUtils'

export const SEARCH_PROPERTY = '$jse:search:property'
export const SEARCH_VALUE = '$jse:search:value'

export function search (key, value, searchText) {
  let results = undefined

  if (typeof key === 'string' && containsCaseInsensitive(key, searchText)) {
    results = createOrAdd(results, SEARCH_PROPERTY, true)
  }

  const type = valueType(value)
  if (type === 'array') {
    value.forEach((item, index) => {
      let childResults = search(index, item, searchText)
      if (childResults) {
        results = createOrAdd(results, index, childResults)
      }
    })
  } else if (type === 'object') {
    Object.keys(value).forEach(prop => {
      let childResults = search(prop, value[prop], searchText)
      if (childResults) {
        results = createOrAdd(results, prop, childResults)
      }
    })
  } else { // type is a value
    if (containsCaseInsensitive(value, searchText)) {
      results = createOrAdd(results, SEARCH_VALUE, true)
    }
  }

  return results
}

function createOrAdd(object, key, value) {
  if (object) {
    object[key] = value
    return object

    // return {
    //     ...object,
    //     [key]: value
    // }
  } else {
    return {
      [key]: value
    }
  }
}

/**
 * Do a case insensitive search for a search text in a text
 * @param {String} text
 * @param {String} searchText
 * @return {boolean} Returns true if `search` is found in `text`
 */
export function containsCaseInsensitive (text, searchText) {
  return String(text).toLowerCase().indexOf(searchText.toLowerCase()) !== -1
}
