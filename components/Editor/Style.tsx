import { useClient } from '@/hooks/useClient'
import React, { useImperativeHandle, useMemo, useState } from 'react'

export interface StyleProps {
  prefix: string
  lines?: number[]
  style: string
}

export interface StyleRef {
  setLines: (lines: number[]) => void
}

export const Style = React.forwardRef<StyleRef, StyleProps>((props: StyleProps, ref) => {
  const { prefix, lines, style } = props

  const [extraLines, setLines] = useState<number[]>([])
  const rules = useMemo(() => (lines ? generateCSSRanges(lines, prefix) : undefined), [prefix, lines])
  const extraRules = useMemo(() => (extraLines ? generateCSSRanges(extraLines, prefix) : undefined), [prefix, extraLines])

  const isClient = useClient()

  useImperativeHandle(ref, () => {
    return { setLines }
  })

  if (!isClient) {
    return null
  }

  return (
    <>
      {rules?.length ? (
        <style>
          {rules.join(',')}
          {`{${style}}`}
        </style>
      ) : null}
      {extraRules?.length ? (
        <style>
          {extraRules.join(',')}
          {`{${style}}`}
        </style>
      ) : null}
    </>
  )
})

function generateCSSRanges(lineNumbers: number[], prefix = '') {
  if (!lineNumbers.length) {
    return []
  }

  const sortedLines = [...new Set(lineNumbers)].sort((a, b) => a - b)
  const ranges = []
  let start = sortedLines[0]

  for (let i = 1; i < sortedLines.length; i++) {
    if (sortedLines[i] !== sortedLines[i - 1] + 1) {
      ranges.push({ start, end: sortedLines[i - 1] })
      start = sortedLines[i]
    }
  }

  ranges.push({ start, end: sortedLines[sortedLines.length - 1] })
  return ranges.map((range) => (range.start === range.end ? `${prefix}:nth-child(${range.start})` : `${prefix}:nth-child(n+${range.start}):nth-child(-n+${range.end})`))
}
