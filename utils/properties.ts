import { Pair, parseLines } from 'dot-properties'

export function isProperties(content: string): boolean {
  const lines = content.split(/\r?\n/)

  let validPropertyLines = 0
  let yamlLikeLines = 0

  for (let rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith('!')) {
      continue
    }

    // Check for YAML array syntax or indentation
    if (/^\s*-\s/.test(rawLine)) {
      yamlLikeLines++
      continue
    }

    // YAML nested or block structure
    if (/^\s{2,}/.test(rawLine)) {
      yamlLikeLines++
      continue
    }

    // YAML-like: key: value (colon followed by space)
    if (/^[^=\s]+:\s+.+$/.test(line)) {
      yamlLikeLines++
      continue
    }

    // Valid properties: key=value or key:xxx (no space after colon)
    if (/^[^=\s]+\s*=\s*.*$/.test(line) || /^[^=\s]+:\S.*$/.test(line) || /^[^=\s]+:$/ .test(line) || /^[^=\s]+=$/ .test(line)) {
      validPropertyLines++
      continue
    }
  }

  // Heuristics: must have at least one valid properties line,
  // and must not be dominated by YAML-like lines
  return validPropertyLines > 0 && yamlLikeLines === 0
}

export function jsonToProperties(obj: any, prefix = '', result: Record<string, string> = {}) {
  for (const key in obj) {
    const value = obj[key]
    const path = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      jsonToProperties(value, path, result)
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          jsonToProperties(item, `${path}.${index}`, result)
        } else {
          result[`${path}.${index}`] = String(item)
        }
      })
    } else {
      result[path] = String(value)
    }
  }

  return result
}

export function toPropertiesText(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
}

export function parsePropertiesText(text: string): Record<string, string> {
  const parsed = parseLines(text, true)
  const result: Record<string, string> = {}

  for (const entry of parsed) {
    if (entry instanceof Pair) {
      result[entry.key] = entry.value ?? ''
    }
  }

  return result
}

function setDeep(root: any, keys: string[], value: string) {
  let current = root

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const isLast = i === keys.length - 1
    const nextKey = keys[i + 1]
    const isIndex = /^\d+$/.test(key)
    const nextIsIndex = /^\d+$/.test(nextKey)

    const currentKey = isIndex ? Number(key) : key

    if (isLast) {
      if (Array.isArray(current) && typeof currentKey === 'number') {
        current[currentKey] = value
      } else {
        current[currentKey] = value
      }
    } else {
      if (current[currentKey] === undefined) {
        current[currentKey] = nextIsIndex ? [] : {}
      }
      current = current[currentKey]
    }
  }
}

export function propertiesToNestedJSON(flat: Record<string, string>) {
  const result: any = {}
  for (const [key, value] of Object.entries(flat)) {
    const path = key.split('.')
    setDeep(result, path, value)
  }
  return result
}
