import * as TOML from '@iarna/toml'

/**
 * Check if the text is a valid TOML array
 */
export function isTomlArray(text: string) {
  try {
    const parsed = TOML.parse(text)
    // Check if there's an array property at the root level
    const hasArrayProperty = Object.values(parsed).some(
      (value) => Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' || (typeof item === 'object' && item !== null))
    )

    return hasArrayProperty
  } catch {
    return false
  }
}
