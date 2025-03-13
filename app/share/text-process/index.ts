import { isJsonArray } from '@/utils/json'
import { isTomlArray } from '@/utils/toml'
import type { TextSegmentPosition } from '@/components/Editor/types'
import { processJsonCollection } from './json'
import { processTomlCollection } from './toml'

/**
 * Handle text input, parse text to text segments
 */
export function processInputText(text: string) {
  const normalizedText = text.normalize('NFKC').trim()
  if (isJsonArray(normalizedText)) {
    return processInputCollection(normalizedText, 'json')
  }

  if (isTomlArray(normalizedText)) {
    return processInputCollection(normalizedText, 'toml')
  }

  const lines = normalizedText.split('\n')
  const positions: TextSegmentPosition[] = []
  lines.forEach((item, index) => {
    const text = item.trim()
    if (!text) {
      return
    }

    const texts = text.split(/[-]/).map((item) => item.trim())
    positions.push({
      texts: [text, ...texts],
      startLine: index + 1,
      endLine: index + 1,
      startColumn: 0,
      endColumn: item.length,
    })
  })

  return positions
}

/**
 * Process collection data (JSON or TOML) into text segments
 */
export function processInputCollection(text: string, format: 'json' | 'toml' = 'json'): TextSegmentPosition[] {
  if (format === 'toml') {
    return processTomlCollection(text)
  }

  return processJsonCollection(text)
}
