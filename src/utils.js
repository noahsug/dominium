import _ from 'underscore'

// Usage: appendValues({a: [1, 2]}, {a: [3], b: [4]}) -> {a: [1, 2, 3], b: [4]}
export function appendObjValues(source, target) {
  _.each(target, (values, key) => {
    source[key] = (source[key] || []).concat(values)
  })
  return source
}

export function logError(err, msg) {
  if (!err) return
  if (msg) console.error(msg)
  console.error(err.message, '\n')
  throw err
}

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
