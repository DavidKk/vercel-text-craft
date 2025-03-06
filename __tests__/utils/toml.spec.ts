import { isToml, isTomlArray } from '@/utils/toml'

describe('TOML Utilities', () => {
  describe('isToml', () => {
    it('should validate valid TOML', () => {
      const validToml = `title = "TOML Example"
[owner]
name = "Tom Preston-Werner"`
      expect(isToml(validToml)).toBe(true)
    })

    it('should reject invalid TOML', () => {
      const invalidToml = `title = "Unclosed Quote
[invalid]
key = value`
      expect(isToml(invalidToml)).toBe(false)
    })

    it('should handle empty string', () => {
      expect(isToml('')).toBe(false)
    })
  })

  describe('isTomlArray', () => {
    it('should validate TOML with string array', () => {
      const tomlWithArray = `
[[fruits]]
name = "apple"

[[fruits]]
name = "banana"
`
      expect(isTomlArray(tomlWithArray)).toBe(true)
    })

    it('should validate TOML with object array', () => {
      const tomlWithObjectArray = `
[[products]]
name = "Hammer"
price = 9.99

[[products]]
name = "Nail"
price = 0.99
`
      expect(isTomlArray(tomlWithObjectArray)).toBe(true)
    })

    it('should reject TOML without array', () => {
      const tomlWithoutArray = `
title = "Regular TOML"
[owner]
name = "Test User"
`
      expect(isTomlArray(tomlWithoutArray)).toBe(false)
    })

    it('should reject TOML with empty array', () => {
      const tomlWithEmptyArray = `fruits = []`
      expect(isTomlArray(tomlWithEmptyArray)).toBe(false)
    })

    it('should reject invalid TOML', () => {
      const invalidToml = `[[fruits]
name = "invalid"`
      expect(isTomlArray(invalidToml)).toBe(false)
    })

    it('should handle empty string', () => {
      expect(isTomlArray('')).toBe(false)
    })
  })
})
