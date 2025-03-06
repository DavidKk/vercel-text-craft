/**
 * Check content consistency between two arrays
 */
export const checkArrayContentConsistency = (sourceArray: any[], targetArray: any[]): boolean => {
  if (sourceArray.length === 0 || targetArray.length === 0) {
    return true
  }

  const sourceSample = sourceArray[0]
  const targetSample = targetArray[0]

  // Check primitive types
  if (typeof sourceSample !== typeof targetSample) {
    return false
  }

  // Check object structure if elements are objects
  if (typeof sourceSample === 'object' && sourceSample !== null) {
    return checkObjectStructure(sourceSample, targetSample)
  }

  return true
}

/**
 * Check if two objects have the same structure
 */
export const checkObjectStructure = (sourceObj: any, targetObj: any): boolean => {
  const sourceKeys = Object.keys(sourceObj)
  const targetKeys = Object.keys(targetObj)

  if (sourceKeys.length !== targetKeys.length) {
    return false
  }
  return sourceKeys.every((key) => targetKeys.includes(key) && typeof sourceObj[key] === typeof targetObj[key])
}

/**
 * Find a compatible array within an object that matches the target array
 */
export const findCompatibleArray = (sourceObj: any, targetArray: any[]): { path: string[]; array: any[] } | null => {
  let result: { path: string[]; array: any[] } | null = null

  const traverse = (current: any, path: string[] = []) => {
    if (Array.isArray(current) && checkArrayContentConsistency(current, targetArray)) {
      if (!result || current.length > result.array.length) {
        result = { path, array: current }
      }
    } else if (typeof current === 'object' && current !== null) {
      for (const key in current) {
        traverse(current[key], [...path, key])
      }
    }
  }

  traverse(sourceObj)
  return result
}

/**
 * Check type consistency within an array
 */
export const checkArrayTypeConsistency = (array: any[]): boolean => {
  if (array.length <= 1) {
    return true
  }
  const firstElementType = typeof array[0]
  return array.every((element) => typeof element === firstElementType)
}

/**
 * Find the longest array within an object and return its path and content
 */
export const findLongestArray = (obj: any): { path: string[]; array: any[] } | null => {
  let result: { path: string[]; array: any[] } | null = null

  const traverse = (current: any, path: string[] = []) => {
    if (Array.isArray(current)) {
      if (!result || current.length > result.array.length) {
        result = { path, array: current }
      }
    } else if (typeof current === 'object' && current !== null) {
      for (const key in current) {
        traverse(current[key], [...path, key])
      }
    }
  }

  traverse(obj)
  return result
}

/**
 * Set a value at a specific path within an object
 */
export const setValueByPath = (obj: any, path: string[], value: any): any => {
  if (path.length === 0) {
    return value
  }
  const result = { ...obj }
  let current = result

  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]] = { ...current[path[i]] }
  }

  current[path[path.length - 1]] = value
  return result
}
