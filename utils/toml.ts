import * as TOML from '@iarna/toml'

/**
 * Check if the text is a valid TOML
 */
export function isToml(text: string) {
  if (!text) {
    return false
  }

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

type JsonValue = string | number | boolean | null | JsonObject | JsonArray

interface JsonObject {
  [key: string]: JsonValue
}

interface JsonArray extends Array<JsonValue> {}

/**
 * Converts a JSON structure into a TOML-compatible format.
 *
 * This function recursively processes the input JSON, splitting mixed-type arrays
 * (e.g. arrays containing both strings and objects) into separate fields to comply with TOML restrictions.
 *
 * @param json - The input JSON value (can be object, array, primitive, or null).
 * @returns A transformed JSON value compatible with TOML serialization.
 */
export function convertToTomlCompatible(json: JsonValue): JsonValue {
  // If input is not an object or is null, return as-is (primitives are unchanged)
  if (typeof json !== 'object' || json === null) {
    return json
  }

  // Clone input to avoid mutating original data
  const clone = structuredClone(json) as JsonObject

  /**
   * Recursive helper to walk an object and transform arrays
   *
   * @param obj - The object to transform
   * @returns The transformed object
   */
  function walk(obj: JsonObject | null): JsonObject | null {
    if (obj === null) return null

    // Collect keys first to avoid issues if object is modified during iteration
    const keys = Object.keys(obj)

    for (const key of keys) {
      const value = obj[key]

      if (Array.isArray(value)) {
        const allStrings = value.every((v) => typeof v === 'string')
        const allObjects = value.every((v) => typeof v === 'object' && v !== null && !Array.isArray(v))

        if (allStrings || allObjects) {
          // Keep arrays of all strings or all objects as-is
          obj[key] = value
        } else {
          // Mixed-type arrays: split into separate fields for TOML compatibility
          const strings = value.filter((v): v is string => typeof v === 'string')
          const objects = value.filter((v): v is JsonObject => typeof v === 'object' && v !== null && !Array.isArray(v))

          obj[key + '_strings'] = strings
          obj[key] = objects
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects
        obj[key] = walk(value as JsonObject)
      }
    }

    return obj
  }

  return walk(clone)
}

export function convertJsonValuetoJsonMap(value: JsonValue): TOML.JsonMap {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as TOML.JsonMap
  }

  if (value === null) {
    return {}
  }

  return { value } as TOML.JsonMap
}
