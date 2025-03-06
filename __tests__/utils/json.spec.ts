import { isJson, isJsonArray } from '@/utils/json'

describe('JSON Validation Utilities', () => {
  describe('isJson', () => {
    it('should validate valid JSON', () => {
      expect(isJson('{"name":"John"}')).toBe(true)
      expect(isJson('[1,2,3]')).toBe(true)
    })

    it('should reject invalid JSON', () => {
      expect(isJson('{name:}')).toBe(false)
      expect(isJson('')).toBe(false)
    })
  })

  describe('isJsonArray', () => {
    it('should validate valid arrays', () => {
      expect(isJsonArray('[1,2,3]')).toBe(true)
      expect(isJsonArray('[{"id":1}]')).toBe(true)
    })

    it('should validate valid objects', () => {
      expect(isJsonArray('{"data":[1,2]}')).toBe(true)
    })

    it('should reject empty arrays', () => {
      expect(isJsonArray('[]')).toBe(false)
    })

    it('should reject scalar values', () => {
      expect(isJsonArray('123')).toBe(false)
      expect(isJsonArray('null')).toBe(false)
    })
  })
})
