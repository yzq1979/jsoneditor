import { isObject } from './typeUtils.js'
import uniqueId from 'lodash/uniqueId.js'

export function createUpdateProps () {
  let prevProps = undefined

  return function updateProps (value) {
    // TODO: optimize. check if value is the same as prevValue, if so, don't do anything

    if (isObject(value)) {
      const props = prevProps
        ? prevProps.filter(item => value[item.key] !== undefined) // copy the props that still exist
        : []

      // process added props
      const prevKeys = new Set(props.map(item => item.key)) // TODO: this is inefficient, creating a set. cache this set?

      console.log('updateProps', { value, prevProps, props})

      Object.keys(value).forEach(key => {
        if (!prevKeys.has(key)) {
          console.log('add key', key)
          props.push({
            id: uniqueId(),
            key
          })
        }
      })

      prevProps = props
      return props
    } else {
      prevProps = undefined
      return undefined
    }
  }
}
