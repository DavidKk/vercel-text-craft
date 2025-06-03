import * as TOML from '@iarna/toml'
import * as YAML from 'js-yaml'
import { isJson } from './json'
import { isToml } from './toml'
import { isProperties, parsePropertiesText, propertiesToNestedJSON } from './properties'

export type ParsedData = {
  type: 'json' | 'toml' | 'properties' | 'yaml' | 'unknown'
  data: Record<string, any> | string | null
}

export function parseText(text: string): ParsedData {
  if (!text) {
    return { type: 'unknown', data: null }
  }

  // Try JSON
  try {
    if (isJson(text)) {
      const data = JSON.parse(text)
      return { type: 'json', data }
    }
  } catch (error) {
    // Continue to next parser if JSON parsing fails
  }

  // Try TOML
  try {
    if (isToml(text)) {
      const data = TOML.parse(text)
      return { type: 'toml', data }
    }
  } catch (error) {
    // Continue to next parser if TOML parsing fails
  }

  // Try Properties
  try {
    if (isProperties(text)) {
      const flat = parsePropertiesText(text)
      const data = propertiesToNestedJSON(flat)
      return { type: 'properties', data }
    }
  } catch (error) {
    // Continue to next parser if Properties parsing fails
  }

  // Try YAML
  try {
    const parsedYaml = YAML.load(text)
    // YAML.load can return various types, including strings, numbers, etc.
    // We should only consider it a successful parse if it results in an object or array.
    if (typeof parsedYaml === 'object' && parsedYaml !== null) {
      return { type: 'yaml', data: parsedYaml as Record<string, any> }
    }
  } catch (error) {
    // Continue to next parser if YAML parsing fails
  }

  return { type: 'unknown', data: null }
}
