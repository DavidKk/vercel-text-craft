'use client'

import { useEffect, useState, useRef } from 'react'
import { useDebounce } from 'ahooks'
import ReactEditor from '@/components/Editor/ReactEditor'
import type { TextSegment } from '@/components/Editor/ReactEditor'
import { calculateMaxSimilarity } from '../share/similarity'
import { processInputText } from '../share/text-process'

export interface TextCompareEditorProps {
  value: string
  /** The target text to compare against */
  targetText: string
  /** Threshold for text similarity (0-1), where 1 means exact match */
  similarityThreshold: number
  /** Key for storing editor content in localStorage */
  storageKey: string
  /** Callback function when text content changes */
  onChange: (value: string) => void
  /** View mode for controlling which lines to display */
  viewMode?: 'all' | 'diffs' | 'similar'
}

export default function TextCompareEditor(props: TextCompareEditorProps) {
  const { value, targetText, similarityThreshold, storageKey, onChange, viewMode = 'all' } = props

  const debouncedText = useDebounce(value, { wait: 500 })
  const debouncedTargetText = useDebounce(targetText, { wait: 500 })
  const debouncedThreshold = useDebounce(similarityThreshold, { wait: 500 })

  const [segments, setSegments] = useState<TextSegment[]>([])
  const [processingBatch, setProcessingBatch] = useState(false)
  const [totalLines, setTotalLines] = useState(0)
  const [processedLines, setProcessedLines] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const processTextComparison = (sourceText: string, targetText: string) => {
    // Process input texts into line segments for comparison
    const aLines = processInputText(sourceText)
    const bLines = processInputText(targetText)

    // Initialize batch processing parameters
    const batchSize = 20
    setTotalLines(aLines.length)
    setProcessedLines(0)

    let currentBatch = 0
    let isCancelled = false
    let overlappedLines = new Set<number>()

    const processNextBatch = () => {
      if (isCancelled) {
        return
      }

      // Calculate the range of lines for the current batch
      const startIdx = currentBatch * batchSize
      const endIdx = Math.min(startIdx + batchSize, aLines.length)
      const batch = aLines.slice(startIdx, endIdx)

      // Calculate similarity for each segment in the batch against all target lines
      const batchResults = batch.map<TextSegment>(({ texts, ...props }) => {
        const maxSimilarity = calculateMaxSimilarity(
          texts,
          bLines.flatMap(({ texts }) => texts)
        )

        // Mark segment as present if similarity exceeds threshold
        const isPresent = maxSimilarity >= debouncedThreshold
        return { ...props, texts, isPresent }
      })

      // Filter out segments that overlap with matched lines
      const filteredResults = batchResults.filter((segment) => {
        if (segment.isPresent) {
          return true
        }

        // Detect lines that overlap with matched segments
        const ignoredLines: number[] = []
        const unOverlappedLines: number[] = []
        for (let line = segment.startLine; line <= segment.endLine; line++) {
          // Check if current line is part of any matched segment
          const isOverlapped = batchResults.some((other) => other !== segment && other.isPresent && line >= other.startLine && line <= other.endLine)
          if (isOverlapped) {
            ignoredLines.push(line)
            continue
          }

          // If child elements overlap (have similarities), ignore the parent lines in similar mode
          // but make sure not to include lines that overlap with others
          if (viewMode === 'similar') {
            unOverlappedLines.push(line)
          }
        }

        if (viewMode === 'similar' && ignoredLines.length > 0) {
          ignoredLines.push(...unOverlappedLines)
        }

        // Remove segment if all its lines are ignored
        if (ignoredLines.length === segment.endLine - segment.startLine + 1) {
          return false
        }

        segment.ignoredLines = ignoredLines

        // Track non-ignored lines for future overlap checks
        for (let line = segment.startLine; line <= segment.endLine; line++) {
          if (!ignoredLines.includes(line)) {
            overlappedLines.add(line)
          }
        }

        return true
      })

      // Update state with processed segments and progress
      setSegments((prev) => [...prev, ...filteredResults])
      setProcessedLines((prev) => Math.min(endIdx, prev + batchResults.length))
      currentBatch++

      // Schedule next batch or finish processing
      if (endIdx < aLines.length && !isCancelled) {
        timeoutRef.current = setTimeout(processNextBatch, 0)
      } else {
        setProcessingBatch(false)
      }
    }

    // Start batch processing
    setSegments([])
    setProcessingBatch(true)
    processNextBatch()

    // Cleanup function for cancelling ongoing processing
    return () => {
      isCancelled = true

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }

  useEffect(() => {
    return processTextComparison(debouncedText, debouncedTargetText)
  }, [debouncedText, debouncedTargetText, debouncedThreshold])

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null

      setProcessingBatch(false)
    }
  }, [value])

  let hiddenLines: number[] = []
  if (viewMode !== 'all') {
    segments.forEach(({ isPresent, startLine, endLine, ignoredLines = [] }) => {
      if (viewMode === 'diffs' ? !isPresent : isPresent) {
        return
      }

      for (let line = startLine; line <= endLine; line++) {
        if (ignoredLines.includes(line)) {
          continue
        }

        hiddenLines.push(line)
      }
    })
  }

  return (
    <>
      <div className="w-full h-1">
        {processingBatch && (
          <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden animate-fade-in">
            <div
              className="h-full bg-indigo-500 transition-transform duration-300 origin-left"
              style={{
                transform: `scaleX(${processedLines / totalLines})`,
                willChange: 'transform',
              }}
            />
          </div>
        )}
      </div>

      <ReactEditor disabled={viewMode !== 'all'} value={debouncedText} onChange={onChange} segments={segments} storageKey={storageKey} hiddenLines={hiddenLines} />
    </>
  )
}
