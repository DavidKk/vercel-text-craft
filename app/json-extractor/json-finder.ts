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
