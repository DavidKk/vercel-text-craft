'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from 'ahooks'
import ReactEditor, { type TextSegment } from '@/components/Editor/ReactEditor'
import { combineFuncs } from '@/utils/func'

export interface TextCompareEditorProps {
  /** The target text to compare against */
  targetText: string
  /** Threshold for text similarity (0-1), where 1 means exact match */
  similarityThreshold: number
  /** Key for storing editor content in localStorage */
  storageKey: string
  /** Callback function when text content changes */
  onChange: (value: string) => void
}

export default function TextCompareEditor(props: TextCompareEditorProps) {
  const { targetText, similarityThreshold, storageKey, onChange } = props

  const [text, setText] = useState<string>('')
  const debouncedText = useDebounce(text, { wait: 300 })
  const debouncedTargetText = useDebounce(targetText, { wait: 300 })
  const debouncedThreshold = useDebounce(similarityThreshold, { wait: 300 })

  const [segments, setSegments] = useState<TextSegment[]>([])
  const [processingBatch, setProcessingBatch] = useState(false)
  const [totalLines, setTotalLines] = useState(0)
  const [processedLines, setProcessedLines] = useState(0)

  const processTextComparison = (sourceText: string, targetText: string) => {
    // Using NFKC normalization to process text, ensuring:
    // 1. Convert full-width characters to half-width
    // 2. Transform combining characters (like diacritics) into precomposed forms
    // 3. Unify visually similar characters with different encodings
    // This enhances the accuracy and consistency of text comparison
    const aLines = sourceText.split('\n').map((item) => item.normalize('NFKC').trim())
    const bLines = targetText.split('\n').map((item) => item.normalize('NFKC').trim())
    const batchSize = 20

    setTotalLines(aLines.length)
    setProcessedLines(0)

    let currentBatch = 0
    let isCancelled = false

    const processNextBatch = () => {
      if (isCancelled) {
        return
      }

      const startIdx = currentBatch * batchSize
      const endIdx = Math.min(startIdx + batchSize, aLines.length)
      const batch = aLines.slice(startIdx, endIdx)

      const batchResults = batch.map<TextSegment>((text) => {
        if (!text) {
          return { text: '', isPresent: true }
        }

        const maxSimilarity = Math.max(
          ...bLines.map((bLine) => {
            return calculateSimilarity(text, bLine)
          })
        )

        return { text, isPresent: maxSimilarity >= debouncedThreshold }
      })

      setSegments((prev) => [...prev, ...batchResults])
      setProcessedLines((prev) => Math.min(endIdx, prev + batchResults.length))
      currentBatch++

      if (endIdx < aLines.length && !isCancelled) {
        setTimeout(processNextBatch, 0)
      } else {
        setProcessingBatch(false)
      }
    }

    setSegments([])
    setProcessingBatch(true)
    processNextBatch()

    return () => {
      isCancelled = true
    }
  }

  useEffect(() => {
    return processTextComparison(debouncedText, debouncedTargetText)
  }, [debouncedText, debouncedTargetText, debouncedThreshold])

  return (
    <div className="w-[calc(50%-0.5rem)]">
      <div className="w-full h-1">
        {processingBatch && (
          <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-200" style={{ width: `${(processedLines / totalLines) * 100}%` }} />
          </div>
        )}
      </div>

      <ReactEditor onChange={combineFuncs(setText, onChange)} segments={segments} storageKey={storageKey} />
    </div>
  )
}

function calculateSimilarity(str1: string, str2: string): number {
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
