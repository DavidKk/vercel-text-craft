import { Parser } from 'acorn'
import type { TextSegmentPosition } from '@/components/Editor/ReactEditor'

/**
 * 检查文本是否为有效的 JSON 数组
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
 * handlle text input, parse text to text segments
 */
export function processInputText(text: string) {
  const normalizedText = text.normalize('NFKC')
  if (isJsonArray(normalizedText)) {
    return processInputCollection(normalizedText)
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

export function processInputCollection(text: string) {
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

      if (stringValues.length == 0) {
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
