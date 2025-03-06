import type { TextSegmentPosition } from '@/components/Editor/ReactEditor'
import { processJsonCollection } from './json'
import { processTomlCollection } from './toml'
import { isJsonArray } from '@/utils/json'
import { isTomlArray } from '@/utils/toml'

/**
 * Handle text input, parse text to text segments
 */
export function processInputText(text: string) {
  const normalizedText = text.normalize('NFKC')
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

    positions.push({
      texts: [text],
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
