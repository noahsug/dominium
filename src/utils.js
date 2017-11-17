import _ from 'underscore'

// Usage: appendValues({a: [1, 2]}, {a: [3], b: [4]}) -> {a: [1, 2, 3], b: [4]}
export function appendObjValues(source, target) {
  _.each(target, (values, key) => {
    source[key] = (source[key] || []).concat(values)
  })
  return source
}
