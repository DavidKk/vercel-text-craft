import { isProperties } from '../../utils/properties'

describe('isProperties', () => {
  it('should return true for valid properties format', () => {
    const validProperties = `key1=value1
key2=value2
key3:value3
# This is a comment
key4=value4`
    expect(isProperties(validProperties)).toBe(true)
  })

  it('should return false for YAML array syntax', () => {
    const yamlArray = `- item1
- item2
key=value`
    expect(isProperties(yamlArray)).toBe(false)
  })

  it('should return false for YAML indentation', () => {
    const yamlIndented = `parent:
  child: value
key=value`
    expect(isProperties(yamlIndented)).toBe(false)
  })

  it('should return false for YAML colon-only syntax', () => {
    const yamlColon = `key: value
another: value`
    expect(isProperties(yamlColon)).toBe(false)
  })

  it('should return false for empty content', () => {
    expect(isProperties('')).toBe(false)
  })

  it('should return false for content with only comments', () => {
    const onlyComments = `# Comment 1
# Comment 2
! Comment 3`
    expect(isProperties(onlyComments)).toBe(false)
  })

  it('should return true for properties with empty values', () => {
    const emptyValues = `key1=
key2:`
    expect(isProperties(emptyValues)).toBe(true)
  })

  it('should return true for properties with spaces around equals/colon', () => {
    const spacedProperties = `key1 = value1
key2 : value2`
    expect(isProperties(spacedProperties)).toBe(true)
  })
})
