import { isYaml } from '@/utils/yaml'

describe('isYaml', () => {
  it('should return true for valid YAML', () => {
    const validYaml = `
      name: John Doe
      age: 30
      hobbies:
        - reading
        - swimming
    `
    expect(isYaml(validYaml)).toBe(true)
  })

  it('should return true for empty YAML', () => {
    expect(isYaml('')).toBe(true)
  })

  it('should return true for simple key-value YAML', () => {
    expect(isYaml('key: value')).toBe(true)
  })

  it('should return false for invalid YAML', () => {
    const invalidYaml = `
      name: John Doe
      age: 30
      hobbies:
        - reading
        - swimming
      invalid: [missing closing bracket
    `
    expect(isYaml(invalidYaml)).toBe(false)
  })

  it('should return false for non-YAML text', () => {
    expect(isYaml('This is just plain text:\ninvalid')).toBe(false)
  })
})
