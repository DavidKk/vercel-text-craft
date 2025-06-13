import {
  checkArrayPrimitiveTypes,
  checkArrayContentConsistency,
  checkObjectStructure,
  findCompatibleArray,
  checkArrayTypeConsistency,
  findLongestArray,
  setValueByPath,
  transformToArrayType,
  mergeArraysWithCheck,
} from '@/utils/array'

describe('Array Utility Functions', () => {
  describe('checkArrayPrimitiveTypes', () => {
    it('should return true for arrays with primitive types', () => {
      expect(checkArrayPrimitiveTypes(['a', 'b'], ['c', 'd'])).toBe(true)
      expect(checkArrayPrimitiveTypes([1, 2], [3, 4])).toBe(true)
      expect(checkArrayPrimitiveTypes([true, false], [true, true])).toBe(true)
    })

    it('should return true for arrays with different primitive types but both in BASE_TYPE', () => {
      expect(checkArrayPrimitiveTypes(['a', 'b'], [1, 2])).toBe(true)
      expect(checkArrayPrimitiveTypes([true, false], ['true', 'false'])).toBe(true)
    })

    it('should return false for arrays with objects', () => {
      const obj1 = { a: 1 }
      const obj2 = { b: 2 }
      expect(checkArrayPrimitiveTypes([obj1], [obj2])).toBe(false)
      expect(checkArrayPrimitiveTypes([obj1], [1, 2])).toBe(false)
    })
  })

  describe('checkArrayContentConsistency', () => {
    it('should return true for empty arrays', () => {
      expect(checkArrayContentConsistency([], [])).toBe(true)
      expect(checkArrayContentConsistency([1, 2], [])).toBe(true)
      expect(checkArrayContentConsistency([], [1, 2])).toBe(true)
    })

    it('should return true for arrays with same primitive types', () => {
      expect(checkArrayContentConsistency(['a', 'b'], ['c', 'd'])).toBe(true)
      expect(checkArrayContentConsistency([1, 2], [3, 4])).toBe(true)
    })

    it('should return true for arrays with objects of same structure', () => {
      const arr1 = [{ a: 1, b: 2 }]
      const arr2 = [{ a: 3, b: 4 }]
      expect(checkArrayContentConsistency(arr1, arr2)).toBe(true)
    })

    it('should return false for arrays with objects of different structure', () => {
      const arr1 = [{ a: 1, b: 2 }]
      const arr2 = [{ a: 1, c: 2 }]
      expect(checkArrayContentConsistency(arr1, arr2)).toBe(false)
    })
  })

  describe('checkObjectStructure', () => {
    it('should return true for objects with same structure', () => {
      const obj1 = { a: 1, b: '2' }
      const obj2 = { a: 3, b: '4' }
      expect(checkObjectStructure(obj1, obj2)).toBe(true)
    })

    it('should return false for objects with different keys', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 1, c: 2 }
      expect(checkObjectStructure(obj1, obj2)).toBe(false)
    })

    it('should return false for objects with different value types', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 1, b: '2' }
      expect(checkObjectStructure(obj1, obj2)).toBe(false)
    })
  })

  describe('findCompatibleArray', () => {
    it('should find compatible array in nested object', () => {
      const sourceObj = {
        a: [1, 2],
        b: {
          c: [3, 4],
          d: [5, 6],
        },
      }
      const targetArray = [7, 8]
      const result = findCompatibleArray(sourceObj, targetArray)
      expect(result).toEqual({
        path: ['a'],
        array: [1, 2],
      })
    })

    it('should return null when no compatible array found', () => {
      const sourceObj = {
        a: [{ x: 1 }],
        b: {
          c: [{ y: 2 }],
        },
      }
      const targetArray = [1, 2]
      expect(findCompatibleArray(sourceObj, targetArray)).toBeNull()
    })
  })

  describe('checkArrayTypeConsistency', () => {
    it('should return true for arrays with consistent types', () => {
      expect(checkArrayTypeConsistency([1, 2, 3])).toBe(true)
      expect(checkArrayTypeConsistency(['a', 'b', 'c'])).toBe(true)
      expect(checkArrayTypeConsistency([true, false])).toBe(true)
    })

    it('should return false for arrays with mixed types', () => {
      expect(checkArrayTypeConsistency([1, '2', 3])).toBe(false)
      expect(checkArrayTypeConsistency([true, 1, 'false'])).toBe(false)
    })

    it('should return true for empty or single-element arrays', () => {
      expect(checkArrayTypeConsistency([])).toBe(true)
      expect(checkArrayTypeConsistency([1])).toBe(true)
    })
  })

  describe('findLongestArray', () => {
    it('should find longest array in nested object', () => {
      const obj = {
        a: [1, 2],
        b: {
          c: [3, 4, 5],
          d: [6, 7],
        },
      }
      const result = findLongestArray(obj)
      expect(result).toEqual({
        path: ['b', 'c'],
        array: [3, 4, 5],
      })
    })

    it('should return null for object without arrays', () => {
      const obj = {
        a: 1,
        b: {
          c: 2,
        },
      }
      expect(findLongestArray(obj)).toBeNull()
    })
  })

  describe('setValueByPath', () => {
    it('should set value at specified path', () => {
      const obj = {
        a: {
          b: {
            c: 1,
          },
        },
      }
      const result = setValueByPath(obj, ['a', 'b', 'c'], 2)
      expect(result.a.b.c).toBe(2)
    })

    it('should create new object when setting value', () => {
      const obj = { a: 1 }
      const result = setValueByPath(obj, ['b', 'c'], 2)
      expect(result).toEqual({
        a: 1,
        b: { c: 2 },
      })
    })
  })

  describe('transformToArrayType', () => {
    it('should transform array to match source array type', () => {
      const sourceArray = ['1', '2']
      const targetArray = [1, 2]
      expect(transformToArrayType(sourceArray, targetArray)).toEqual(['1', '2'])
    })

    it('should transform objects to match source array structure', () => {
      const sourceArray = [{ a: 1, b: 2 }]
      const targetArray = [{ a: 3 }]
      expect(transformToArrayType(sourceArray, targetArray)).toEqual([{ a: 3, b: 2 }])
    })

    it('should return empty array for non-array input', () => {
      const sourceArray = [1, 2]
      expect(transformToArrayType(sourceArray, 'not an array')).toEqual([])
    })
  })

  describe('mergeArraysWithCheck', () => {
    it('should merge arrays when content is consistent', () => {
      const sourceArray = [1, 2]
      const targetArray = [3, 4]
      const result = mergeArraysWithCheck(sourceArray, targetArray)
      expect(result).toEqual([1, 2, 3, 4])
    })

    it('should transform and merge arrays when types are similar', () => {
      const sourceArray = ['1', '2']
      const targetArray = [3, 4]
      const result = mergeArraysWithCheck(sourceArray, targetArray, true)
      expect(result).toEqual(['1', '2', '3', '4'])
    })

    it('should return null when arrays are not compatible', () => {
      const sourceArray = [{ a: 1 }]
      const targetArray = [{ b: 2 }]
      const result = mergeArraysWithCheck(sourceArray, targetArray)
      expect(result).toBeNull()
    })

    it('should use callback when provided', () => {
      const sourceArray = [1, 2]
      const targetArray = [3, 4]
      const callback = jest.fn((arr) => ({ merged: arr }))
      const result = mergeArraysWithCheck(sourceArray, targetArray, false, callback)
      expect(callback).toHaveBeenCalledWith([1, 2, 3, 4])
      expect(result).toEqual({ merged: [1, 2, 3, 4] })
    })
  })
})
