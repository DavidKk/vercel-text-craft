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
