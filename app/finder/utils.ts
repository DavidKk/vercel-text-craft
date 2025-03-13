import * as TOML from '@iarna/toml'
import yaml from 'js-yaml'

export type FormatType = 'json' | 'toml' | 'yaml'

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
      default:
        return text
    }
  } catch {
    // If JSON parsing fails, return the original text
    return text
  }
}