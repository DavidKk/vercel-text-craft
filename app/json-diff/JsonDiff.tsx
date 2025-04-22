'use client'

import { useState, useMemo } from 'react'
import ReactEditor, { type TextSegment } from '@/components/Editor/ReactEditor'
import { isJson } from '@/utils/json'

export default function JsonDiff() {
  const [leftJson, setLeftJson] = useState('')
  const [rightJson, setRightJson] = useState('')

  const compareJson = (left: string, right: string) => {
    if (!isJson(left) || !isJson(right)) {
      return []
    }

    const leftObj = JSON.parse(left)
    const rightObj = JSON.parse(right)

    const segments: Array<Omit<TextSegment, 'startColumn' | 'endColumn' | 'className'> & { type: string }> = []
    const leftLines = JSON.stringify(leftObj, null, 2).split('\n')
    const rightLines = JSON.stringify(rightObj, null, 2).split('\n')

    let i = 0
    while (i < leftLines.length || i < rightLines.length) {
      if (i >= leftLines.length) {
        segments.push({ startLine: i + 1, endLine: i + 1, texts: [rightLines[i]], type: 'add' })
      } else if (i >= rightLines.length) {
        segments.push({ startLine: i + 1, endLine: i + 1, texts: [leftLines[i]], type: 'delete' })
      } else if (leftLines[i] !== rightLines[i]) {
        segments.push({ startLine: i + 1, endLine: i + 1, texts: [leftLines[i]], type: 'modify' })
      }
      i++
    }

    return segments
  }

  const leftSegments = useMemo<TextSegment[]>(() => {
    return compareJson(rightJson, leftJson).map((seg) => ({
      className: seg.type === 'add' ? 'bg-green-100' : seg.type === 'delete' ? 'bg-red-100' : 'bg-blue-100',
      startLine: seg.startLine,
      endLine: seg.endLine,
      startColumn: 0,
      endColumn: 0,
    }))
  }, [leftJson, rightJson, compareJson])

  const rightSegments = useMemo<TextSegment[]>(() => {
    return compareJson(leftJson, rightJson).map((seg) => ({
      className: seg.type === 'add' ? 'bg-green-100' : seg.type === 'delete' ? 'bg-red-100' : 'bg-blue-100',
      startLine: seg.startLine,
      endLine: seg.endLine,
      startColumn: 0,
      endColumn: 0,
    }))
  }, [leftJson, rightJson, compareJson])

  const formatJson = (text: string) => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2)
    } catch {
      return text
    }
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-4">
      <ReactEditor
        className="flex-1 min-h-[40vh] md:min-h-[70vh]"
        title="Original JSON"
        value={leftJson}
        onChange={setLeftJson}
        onBlur={(value) => setLeftJson(formatJson(value))}
        storageKey="json-diff-left"
        segments={leftSegments}
      />

      <ReactEditor
        className="flex-1 min-h-[40vh] md:min-h-[70vh]"
        title="Modified JSON"
        value={rightJson}
        onChange={setRightJson}
        onBlur={(value) => setRightJson(formatJson(value))}
        storageKey="json-diff-right"
        segments={rightSegments}
      />
    </div>
  )
}
