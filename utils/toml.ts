import * as TOML from '@iarna/toml'

/**
 * Check if the text is a valid TOML
 */
export function isToml(text: string) {
  try {
    TOML.parse(text)
    return true
  } catch {
    return false
  }
}

/**
 * Check if the text is a valid TOML array
 */
export function isTomlArray(text: string) {
  try {
    const parsed = TOML.parse(text)
    // Check if there's an array property at the root level
    const hasArrayProperty = Object.values(parsed).some((value) => {
      if (Array.isArray(value) && value.length > 0) {
        return value.every((item) => {
          if (typeof item === 'string') {
            return true
          }
          if (typeof item === 'object' && item !== null) {
            return true
          }
          return false
        })
      }
      return false
    })

    return hasArrayProperty
  } catch {
    return false
  }
}
