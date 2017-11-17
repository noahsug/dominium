import _ from 'underscore'

// Usage: appendValues({a: [1, 2]}, {a: [3], b: [4]}) -> {a: [1, 2, 3], b: [4]}
export function appendObjValues(source, target) {
  _.each(target, (values, key) => {
    source[key] = (source[key] || []).concat(values)
  })
  return source
}

// Note: Does not work when the function returns a promise.
export function memoize(fn) {
  if (isAsync(fn)) return memoizeAsync(fn)
  const cache = {}
  return (...args) => {
    const key = JSON.stringify(args)
    if (!cache[key]) cache[key] = fn(...args)
    return cache[key]
  }
}

export function memoizeAsync(fn) {
  const cache = {}
  return async (...args) => {
    const key = JSON.stringify(args)
    if (!cache[key]) cache[key] = await fn(...args)
    return cache[key]
  }
}

// Does not work for promises.
export function isAsync(fn) {
  return fn.constructor.name === 'AsyncFunction'
}
