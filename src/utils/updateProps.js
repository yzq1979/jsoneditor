import { isObject } from './typeUtils.js'
import { uniqueId } from 'lodash-es'

export function updateProps (value, prevProps) {
  if (isObject(value)) {
    // copy the props that still exist
    const props = prevProps
      ? prevProps.filter(item => value[item.key] !== undefined) 
      : []

    // add new props
    const prevKeys = new Set(props.map(item => item.key))
    Object.keys(value).forEach(key => {
      if (!prevKeys.has(key)) {
        props.push({
          id: uniqueId(),
          key
        })
      }
    })

    return props
  } else {
    return undefined
  }
}
