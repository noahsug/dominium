import _ from 'underscore'

export function appendValues(source, target) {
  _.each(target, (values, key) => {
    source[key] = (source[key] || []).concat(values)
  })
}

export function memoize(fn) {
  const cache = {}
  if (isAsync(fn)) {
    return async (...args) => {
      const key = JSON.stringify(args)
      if (!cache[key]) cache[key] = await fn(...args)
      return cache[key]
    }
  } else {
    return (...args) => {
      const key = JSON.stringify(args)
      if (!cache[key]) cache[key] = fn(...args)
      return cache[key]
    }
  }
}

// Does not work for promises.
export function isAsync(fn) {
  return fn.constructor.name === 'AsyncFunction'
}
