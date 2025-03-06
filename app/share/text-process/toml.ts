import * as TOML from '@iarna/toml'
import type { TextSegmentPosition } from '@/components/Editor/ReactEditor'

/**
 * Process TOML array data into text segments
 */
export function processTomlCollection(text: string): TextSegmentPosition[] {
  try {
    const parsed = TOML.parse(text)
    const result: TextSegmentPosition[] = []
    const lines = text.split('\n')

    // Process arrays in TOML content
    Object.entries(parsed).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Find array item boundaries in the original text
        const arrayItems: { item: any; startLine: number; endLine: number }[] = []

        // Find each array item's boundaries in the source text
        let currentArrayItem: { item: any; startLine: number; endLine: number } | null = null
        let inArrayItem = false

        lines.forEach((line, lineIndex) => {
          const trimmedLine = line.trim()

          // Detect start of an array item with [[arrayName]]
          if (trimmedLine.startsWith(`[[${key}]]`)) {
            inArrayItem = true
            currentArrayItem = {
              item: {},
              startLine: lineIndex + 1,
              endLine: lineIndex + 1,
            }
          }
          // Empty line or next item marker can indicate the end of current item
          else if (inArrayItem && (trimmedLine === '' || trimmedLine.startsWith('[['))) {
            if (currentArrayItem) {
              currentArrayItem.endLine = lineIndex // End at previous line
              arrayItems.push(currentArrayItem)
              currentArrayItem = null
              inArrayItem = trimmedLine.startsWith('[[') // If it's a new array item, stay in array mode
            }
          }
          // Update end line as we process content
          else if (inArrayItem && currentArrayItem) {
            currentArrayItem.endLine = lineIndex + 1
          }
        })

        // Add the last item if we're still tracking one
        if (inArrayItem && currentArrayItem) {
          arrayItems.push(currentArrayItem)
        }

        // Match array items with parsed data
        value.forEach((item, index) => {
          const itemPosition = arrayItems[index] || { startLine: 1, endLine: 1 }

          if (typeof item === 'string') {
            result.push({
              texts: [item],
              startLine: itemPosition.startLine,
              endLine: itemPosition.endLine,
              startColumn: 0,
              endColumn: item.length,
            })
          } else if (typeof item === 'object' && item !== null) {
            const stringValues = Object.values(item)
              .filter((val) => typeof val === 'string')
              .map((val) => val as string)

            if (stringValues.length > 0) {
              result.push({
                texts: stringValues,
                startLine: itemPosition.startLine,
                endLine: itemPosition.endLine,
                startColumn: 0,
                endColumn: 80, // Approximate width
              })
            }
          }
        })
      }
    })

    return result
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error processing TOML:', error)
    return []
  }
}
