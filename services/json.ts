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
