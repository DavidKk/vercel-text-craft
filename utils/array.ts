const BASE_TYPE = ['string', 'number', 'boolean']

/**
 * Check if arrays contain only primitive types
 * This function checks if the elements in both arrays are of primitive types (string, number, or boolean)
 *
 * @param sourceArray - The source array to check
 * @param targetArray - The target array to compare against
 * @returns boolean - True if both arrays contain only primitive types
 *
 * @example
 * // Returns true
 * checkArrayPrimitiveTypes(['a', 'b'], ['c', 'd'])
 * checkArrayPrimitiveTypes([1, 2], [3, 4])
 * checkArrayPrimitiveTypes([true, false], [true, true])
 *
 * // Returns false
 * checkArrayPrimitiveTypes(['a', 'b'], [1, 2])
 * checkArrayPrimitiveTypes([{a: 1}], [{b: 2}])
 */
export function checkArrayPrimitiveTypes(sourceArray: any[], targetArray: any[]) {
  const sourceSample = sourceArray[0]
  const targetSample = targetArray[0]

  const sourceType = typeof sourceSample
  const targetType = typeof targetSample

  return BASE_TYPE.includes(sourceType) && BASE_TYPE.includes(targetType)
}

/**
 * Check content consistency between two arrays
 */
export function checkArrayContentConsistency(sourceArray: any[], targetArray: any[]): boolean {
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
export function checkObjectStructure(sourceObj: any, targetObj: any): boolean {
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
export function findCompatibleArray(sourceObj: any, targetArray: any[]): { path: string[]; array: any[] } | null {
  let result: { path: string[]; array: any[] } | null = null

  function traverse(current: any, path: string[] = []) {
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
export function checkArrayTypeConsistency(array: any[]): boolean {
  if (array.length <= 1) {
    return true
  }
  const firstElementType = typeof array[0]
  return array.every((element) => typeof element === firstElementType)
}

/**
 * Find the longest array within an object and return its path and content
 */
export function findLongestArray(obj: any): { path: string[]; array: any[] } | null {
  let result: { path: string[]; array: any[] } | null = null

  function traverse(current: any, path: string[] = []) {
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
export function setValueByPath(obj: any, path: string[], value: any): any {
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

/**
 * Transform data to match the type of the source array
 * @param sourceArray The source array that defines the target type
 * @param data The data to be transformed
 * @returns Transformed data matching the source array type
 */
export function transformToArrayType(sourceArray: any[], data: any): any[] {
  if (!Array.isArray(data)) {
    return []
  }

  if (sourceArray.length === 0) {
    return []
  }

  const sourceSample = sourceArray[0]
  const sourceType = typeof sourceSample

  // Handle primitive types
  if (BASE_TYPE.includes(sourceType)) {
    return data.map((item) => {
      switch (sourceType) {
        case 'string':
          return String(item)
        case 'number':
          return Number(item)
        case 'boolean':
          return Boolean(item)
        default:
          return item
      }
    })
  }

  // Handle object types
  if (typeof sourceSample === 'object' && sourceSample !== null) {
    return data.map((item) => {
      if (typeof item !== 'object' || item === null) {
        return {}
      }

      const result: any = {}
      Object.keys(sourceSample).forEach((key) => {
        result[key] = item[key] !== undefined ? item[key] : sourceSample[key]
      })
      return result
    })
  }

  return data
}

/**
 * Merge arrays with type checking and optional transformation
 * @param sourceArray The source array to merge into
 * @param targetArray The target array to merge from
 * @param shouldTransform Whether to transform the target array to match source array type
 * @param setValueCallback Optional callback to set the merged value in the parent object
 * @returns The merged array or null if merge is not possible
 */
export function mergeArraysWithCheck(sourceArray: any[], targetArray: any[], shouldTransform = false, setValueCallback?: (mergedArray: any[]) => any): any[] | null {
  const arrayToMerge = shouldTransform ? transformToArrayType(sourceArray, targetArray) : targetArray
  if (shouldTransform || checkArrayContentConsistency(sourceArray, arrayToMerge)) {
    const mergedArray = [...sourceArray, ...arrayToMerge]
    return setValueCallback ? setValueCallback(mergedArray) : mergedArray
  }

  return null
}
