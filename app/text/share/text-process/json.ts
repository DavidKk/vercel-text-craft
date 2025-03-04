import { Parser } from 'acorn'
import type { TextSegmentPosition } from '@/components/Editor/ReactEditor'

/**
 * Check if the text is a valid JSON array
 */
export function isJsonArray(text: string) {
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return true
    }

    if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length) {
      return true
    }

    return false
  } catch {
    return false
  }
}

export function processJsonCollection(text: string): TextSegmentPosition[] {
  try {
    // 将 JSON 对象包装在数组中以符合 ACORN 解析器要求
    const wrappedText = `[\n${text}]`
    const ast = Parser.parse(wrappedText, {
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

    const result = processArray(firstNode.expression.elements)
    console.log(result)
    return result
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error processing JSON:', error)
    return []
  }
}

/**
 * Process JSON array data into text segments
 */
function processString(element: any): TextSegmentPosition | null {
  if (element && element.type === 'Literal' && typeof element.value === 'string' && element.loc) {
    return {
      texts: [element.value],
      startLine: (element.loc.start.line || 1) - 1,
      endLine: (element.loc.end.line || 1) - 1,
      startColumn: element.loc.start.column || 0,
      endColumn: element.loc.end.column || 0,
    }
  }

  return null
}

function processObject(obj: any): TextSegmentPosition[] {
  const result: TextSegmentPosition[] = []
  if (!obj || !obj.properties || !obj.loc) {
    return result
  }

  const stringValues: string[] = []
  obj.properties.forEach((prop: any) => {
    if (prop.value.type === 'Literal' && typeof prop.value.value === 'string') {
      stringValues.push(prop.value.value)
    } else if (prop.value.type === 'ObjectExpression') {
      result.push(...processObject(prop.value))
    } else if (prop.value.type === 'ArrayExpression') {
      result.push(...processArray(prop.value.elements))
    }
  })

  if (stringValues.length > 0) {
    result.push({
      texts: stringValues,
      startLine: (obj.loc.start.line || 1) - 1,
      endLine: (obj.loc.end.line || 1) - 1,
      startColumn: obj.loc.start.column || 0,
      endColumn: obj.loc.end.column || 0,
    })
  }

  return result
}

function processArray(elements: any[]): TextSegmentPosition[] {
  const result: TextSegmentPosition[] = []
  if (!elements || !Array.isArray(elements)) {
    return result
  }

  elements.forEach((element) => {
    if (element.type === 'Literal' && typeof element.value === 'string') {
      const stringPosition = processString(element)
      if (stringPosition) {
        result.push(stringPosition)
      }
    } else if (element.type === 'ObjectExpression') {
      result.push(...processObject(element))
    } else if (element.type === 'ArrayExpression') {
      // 递归处理嵌套数组中的每个元素
      result.push(...processArray(element.elements))
    }
  })

  return result
}
