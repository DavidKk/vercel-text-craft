export function combineFuncs<T extends any[], R>(...funcs: ((...args: T) => R)[]): (...args: T) => R {
  return (...args: T) => {
    let result: R
    for (const func of funcs) {
      result = func(...args)
    }

    return result!
  }
}
