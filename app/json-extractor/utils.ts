import * as TOML from '@iarna/toml'
import yaml from 'js-yaml'
import { jsonToProperties, toPropertiesText } from '@/utils/properties'

export type FormatType = 'json' | 'toml' | 'yaml' | 'properties'

export function formatText(text: string, format: FormatType): string {
  try {
    // First try to parse the input as JSON
    const data = JSON.parse(text)

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'toml':
        return TOML.stringify(data)
      case 'yaml':
        return yaml.dump(data)
      case 'properties':
        const flattened = jsonToProperties(data)
        const propertiesText = toPropertiesText(flattened)
        return propertiesText
      default:
        return text
    }
  } catch {
    // If JSON parsing fails, return the original text
    return text
  }
}
