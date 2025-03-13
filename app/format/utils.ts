import type { FormatType } from './constants'

export function formatText(text: string, format: FormatType) {
  try {
    const lines = text.split('\n').filter((line) => line.trim())
    let data = lines.map((line) => line.trim())
    let result = ''

    switch (format) {
      case 'json':
        result = JSON.stringify(data, null, 2)
        break
      case 'toml':
        result = `data = ${JSON.stringify(data, null, 2)}`
        break
      case 'yaml':
        result = `data\n${data.map((item: string) => `  - ${item}`).join('\n')}`
        break
      case 'csv':
        result = 'data\n' + data.join('\n')
        break
      default:
        result = data.join('\n')
    }

    return result
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Conversion failed'}`
  }
}
