'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from 'ahooks'
import ReactEditor from '@/components/Editor/ReactEditor'
import type { TextSegment } from '@/components/Editor/ReactEditor'
import { combineFuncs } from '@/utils/func'
import { processInputText, calculateSimilarity } from '@/app/text/utils'

export interface TextCompareEditorProps {
  /** The target text to compare against */
  targetText: string
  /** Threshold for text similarity (0-1), where 1 means exact match */
  similarityThreshold: number
  /** Key for storing editor content in localStorage */
  storageKey: string
  /** Callback function when text content changes */
  onChange: (value: string) => void
  /** Whether to show only different lines */
  showOnlyDiffs?: boolean
}

export default function TextCompareEditor(props: TextCompareEditorProps) {
  const { targetText, similarityThreshold, storageKey, onChange, showOnlyDiffs } = props

  const [text, setText] = useState<string>('')
  const debouncedText = useDebounce(text, { wait: 300 })
  const debouncedTargetText = useDebounce(targetText, { wait: 300 })
  const debouncedThreshold = useDebounce(similarityThreshold, { wait: 300 })

  const [segments, setSegments] = useState<TextSegment[]>([])
  const [processingBatch, setProcessingBatch] = useState(false)
  const [totalLines, setTotalLines] = useState(0)
  const [processedLines, setProcessedLines] = useState(0)

  const processTextComparison = (sourceText: string, targetText: string) => {
    const aLines = processInputText(sourceText)
    const bLines = processInputText(targetText)

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
      const batchResults = batch.map<TextSegment>(({ texts, ...props }) => {
        if (!texts.length) {
          return { ...props, texts, isPresent: true }
        }

        // calculate similarity between the current string and each string in the target text
        const maxSimilarity = Math.max(...bLines.flatMap((bLine) => texts.map((text) => calculateSimilarity(text, bLine.texts[0]))))
        const isPresent = maxSimilarity >= debouncedThreshold
        return { ...props, texts, isPresent }
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

  let hiddenLines: number[] = []
  if (showOnlyDiffs) {
    segments.forEach(({ isPresent, startLine, endLine }) => {
      if (!isPresent) {
        return
      }

      new Array(endLine - startLine + 1).fill(0).forEach((_, i) => {
        hiddenLines.push(startLine + i)
      })
    })
  }

  return (
    <>
      <div className="w-full h-1">
        {processingBatch && (
          <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-200" style={{ width: `${(processedLines / totalLines) * 100}%` }} />
          </div>
        )}
      </div>

      <ReactEditor onChange={combineFuncs(setText, onChange)} segments={segments} storageKey={storageKey} hiddenLines={hiddenLines} />
    </>
  )
}
