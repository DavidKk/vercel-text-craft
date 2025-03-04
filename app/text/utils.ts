import { Parser } from 'acorn'
import type { TextSegmentPosition } from '@/components/Editor/ReactEditor'

import * as TOML from '@iarna/toml'

/**
 * Check if the text is a valid JSON array
 */
export function isJsonArray(text: string) {
  try {
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return false
    }

    return parsed.every((item) => typeof item === 'string' || (typeof item === 'object' && item !== null))
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
    const hasArrayProperty = Object.values(parsed).some(
      (value) => Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' || (typeof item === 'object' && item !== null))
    )

    return hasArrayProperty
  } catch {
    return false
  }
}

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
 * Process TOML array data into text segments
 */
function processTomlCollection(text: string): TextSegmentPosition[] {
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

/**
 * Process JSON array data into text segments
 */
function processJsonCollection(text: string): TextSegmentPosition[] {
  try {
    const ast = Parser.parse(text, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
    })

    if (!(ast.type === 'Program' && ast.body.length > 0)) {
      return []
    }

    const firstNode = ast.body[0]
    if (!(firstNode.type === 'ExpressionStatement' && firstNode.expression.type === 'ArrayExpression')) {
      return []
    }

    const result: TextSegmentPosition[] = []
    firstNode.expression.elements.forEach((element) => {
      if (element && element.type === 'Literal' && typeof element.value === 'string') {
        result.push({
          texts: [element.value],
          startLine: element.loc?.start.line || 0,
          endLine: element.loc?.end.line || 0,
          startColumn: element.loc?.start.column || 0,
          endColumn: element.loc?.end.column || 0,
        })
      } else if (element && element.type === 'ObjectExpression') {
        const properties = element.properties
        const stringValues: string[] = []

        properties.forEach((prop) => {
          if (prop.type === 'Property' && prop.value.type === 'Literal' && typeof prop.value.value === 'string') {
            stringValues.push(prop.value.value)
          }
        })

        if (stringValues.length === 0) {
          return
        }

        const startLine = element.loc?.start.line || 0
        const endLine = element.loc?.end.line || 0
        const startColumn = element.loc?.start.column || 0
        const endColumn = element.loc?.end.column || 0

        result.push({
          texts: stringValues,
          startLine: startLine,
          endLine: endLine,
          startColumn: startColumn,
          endColumn: endColumn,
        })
      }
    })

    return result
  } catch {
    return []
  }
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

/**
 * calculate the similarity between two strings
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) {
    return 1
  }

  if (str1.length === 0 || str2.length === 0) {
    return 0
  }

  const matrix: number[][] = []
  for (let i = 0; i <= str1.length; i++) {
    matrix[i] = [i]
    for (let j = 1; j <= str2.length; j++) {
      if (i === 0) {
        matrix[i][j] = j
      } else {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
      }
    }
  }

  const maxLength = Math.max(str1.length, str2.length)
  return 1 - matrix[str1.length][str2.length] / maxLength
}

/**
 * Calculate the maximum similarity between two arrays of strings
 */
export function calculateMaxSimilarity(sourceTexts: string[], targetTexts: string[]): number {
  if (!sourceTexts.length || !targetTexts.length) {
    return 0
  }

  return Math.max(...sourceTexts.flatMap((sourceText) => targetTexts.map((targetText) => calculateSimilarity(sourceText, targetText))))
}
