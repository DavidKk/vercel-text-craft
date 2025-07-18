/**
 * String extraction configuration options
 */
export interface ExtractStringOptions {
  /** Whether to include outer quotes (default false) */
  keepQuotes?: boolean
  /** Whether to parse escape characters (default true) */
  unescape?: boolean
}

/**
 * Extract all strings from text (supports escape characters)
 * @param text Input text
 * @param options Configuration options
 * @returns Array of extracted strings (outer quotes removed and escapes processed)
 */
export function extractAllStrings(text: string, options: ExtractStringOptions = {}): string[] {
  const { keepQuotes = false, unescape = true } = options
  const strings: string[] = []

  let inString = false
  let currentQuote = ''
  let escapeNext = false
  let startIndex = -1

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    // Handle string start/end
    if (!inString && (char === '"' || char === "'")) {
      inString = true
      currentQuote = char
      startIndex = i
      continue
    }

    // Handle escape characters
    if (inString && !escapeNext && char === '\\') {
      escapeNext = true
      continue
    }

    // Handle string end
    if (inString && !escapeNext && char === currentQuote) {
      const rawString = text.slice(startIndex, i + 1)
      strings.push(keepQuotes ? rawString : processString(rawString.slice(1, -1), unescape))
      inString = false
      continue
    }

    escapeNext = false
  }

  return strings
}

/** Process string content (parse escape characters) */
function processString(str: string, unescape: boolean): string {
  if (!unescape) {
    return str
  }

  return str.replace(/\\(.)/g, (_, char) => {
    switch (char) {
      case 'n':
        return '\n'
      case 'r':
        return '\r'
      case 't':
        return '\t'
      case 'b':
        return '\b'
      case 'f':
        return '\f'
      case 'v':
        return '\v'
      case '0':
        return '\0'
      case '\\':
        return '\\'
      case '"':
        return '"'
      case "'":
        return "'"
      default:
        return char // Keep unknown escapes as is
    }
  })
}

/** Detect the dominant quote type in text */
export function detectDominantQuote(text: string): '"' | "'" {
  let doubleQuotes = 0
  let singleQuotes = 0

  let inString = false
  let currentQuote: '"' | "'" | null = null
  let escapeNext = false

  for (const char of text) {
    if (!inString && (char === '"' || char === "'")) {
      inString = true
      currentQuote = char
      continue
    }

    if (inString && !escapeNext && char === currentQuote) {
      inString = false
      if (currentQuote === '"') doubleQuotes++
      else singleQuotes++
      currentQuote = null
      continue
    }

    escapeNext = inString && !escapeNext && char === '\\'
  }

  // Return the quote type that appears more frequently
  return doubleQuotes >= singleQuotes ? '"' : "'"
}

/**
 * Extracts JSON objects from a string that may contain surrounding text.
 * Handles cases like "prefix {json} suffix" or multiple JSONs "prefix {jsonA} suffix {jsonB} prefix".
 * @param text The input string.
 * @returns An array of extracted JSON strings (formatted with 2 spaces).
 */
export function extractJsonWithSurroundingText(text: string): string[] {
  const results: string[] = []
  let balance = 0
  let startIndex = -1

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '{') {
      if (balance === 0) {
        startIndex = i
      }
      balance++
    } else if (char === '}') {
      balance--
      if (balance === 0 && startIndex !== -1) {
        const potentialJson = text.substring(startIndex, i + 1)
        try {
          const parsed = JSON.parse(potentialJson)
          // Ensure it's an object or array before considering it a valid JSON
          if (typeof parsed === 'object' && parsed !== null) {
            results.push(JSON.stringify(parsed, null, 2))
          }
        } catch (e) {
          // Not a valid JSON, ignore
        }
        startIndex = -1 // Reset for next potential JSON
      }
    } else if (balance < 0) {
      // Reset if brackets are mismatched (e.g. "xxx } {json}")
      balance = 0
      startIndex = -1
    }
  }
  return results
}
