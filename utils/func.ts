export function combineFuncs<T extends any[], R>(...funcs: Array<((...args: T) => R) | undefined>): (...args: T) => R {
  return (...args: T) => {
    let result: R
    for (const func of funcs) {
      if (typeof func === 'function') {
        result = func(...args)
      }
    }

    return result!
  }
}
