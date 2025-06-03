import { Pair, parseLines } from 'dot-properties'

export function isProperties(content: string): boolean {
  const lines = content.split(/\r?\n/)

  let hasValidEntry = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('#') || line.startsWith('!')) {
      continue
    }

    const match = line.match(/^([^:=\s]+)\s*[:=\s]\s*(.*)$/)
    if (!match) {
      return false
    }

    hasValidEntry = true
  }

  return hasValidEntry
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
