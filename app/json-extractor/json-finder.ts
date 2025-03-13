/**
 * Extract all string values from an object
 */
function extractStringsFromObject(obj: any): string[] {
  const strings: string[] = []

  if (typeof obj === 'string') {
    strings.push(obj)
    return strings
  }

  function traverse(value: any) {
    if (typeof value === 'string') {
      strings.push(value)
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          traverse(value[key])
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach(traverse)
    }
  }

  traverse(obj)
  return strings
}

/**
 * Find valid JSON strings from a text
 */
function findValidJsonStrings(text: string): string[] {
  const results: string[] = []

  // Use greedy mode to match outermost curly braces or square brackets
  const regex = /[{\[]([^{}\[\]]*|[{\[].*[}\]])*[}\]]/g
  let match

  while ((match = regex.exec(text)) !== null) {
    try {
      const jsonStr = match[0]
      // Analyze bracket pairing and escape characters
      let bracketCount = 0
      let inString = false
      let escaped = false
      let validJson = true

      for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr[i]

        if (escaped) {
          escaped = false
          continue
        }

        if (char === '\\') {
          escaped = true
          continue
        }

        if (char === '"' && !escaped) {
          inString = !inString
          continue
        }

        if (!inString) {
          if (char === '{' || char === '[') {
            bracketCount++
          } else if (char === '}' || char === ']') {
            bracketCount--
          }

          if (bracketCount < 0) {
            validJson = false
            break
          }
        }
      }

      if (validJson && bracketCount === 0) {
        try {
          // Validate if it's a valid JSON
          JSON.parse(jsonStr)
          if (!results.includes(jsonStr)) {
            results.push(jsonStr)
            break
          }
        } catch {}
      }
    } catch {}
  }

  return results
}

export function findJsonStrings(text: string) {
  const strings: string[] = []

  try {
    const parsed = JSON.parse(text)
    strings.push(...extractStringsFromObject(parsed))
  } catch {}

  const results: string[] = []
  for (const str of strings) {
    const jsonStrings = findValidJsonStrings(str)
    results.push(...jsonStrings)
  }

  return results
}
