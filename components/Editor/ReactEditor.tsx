'use client'

import React, { useMemo, useState, useRef, useId } from 'react'
import FeatherIcon from 'feather-icons-react'
import { combineFuncs } from '@/utils/func'
import BaseEditor from './BaseEditor'

export interface TextSegment {
  /** The text content of the segment */
  text: string
  /** Whether this segment is present in the comparison text */
  isPresent: boolean
  /** Optional array of line numbers where this segment matches */
  matchingLines?: number[]
}

export interface ReactEditorProps {
  /** Array of text segments to be displayed in the editor */
  segments: TextSegment[]
  /** Key for storing editor content in localStorage */
  storageKey?: string
  /** Callback function when editor content changes */
  onChange: (value: string) => void
  /** Array of line numbers to be hidden, if empty or undefined all lines will be visible */
  hiddenLines?: number[]
}

export default function ReactEditor(props: ReactEditorProps) {
  const { onChange, segments, storageKey, hiddenLines } = props

  const rawUid = useId()
  const uid = useMemo(() => `${rawUid.replace(/[^a-zA-Z0-9]/g, '')}`, [rawUid])

  const editorRef = useRef<HTMLDivElement>(null)
  const [internalValue, setValue] = useState<string>('')
  const lineNumbers = useMemo(() => internalValue.split('\n').length + 1, [internalValue])

  const { diffRules, hiddenRules } = useMemo(() => {
    const diffRules = segments.map(({ isPresent }, index) => (!isPresent ? `.editor-container.${uid} .editor > div:nth-child(${index + 1})` : ''))
    const hiddenRules = hiddenLines?.map((lineNum) => `.editor-container.${uid} .editor > div:nth-child(${lineNum})`) || []

    return {
      diffRules: diffRules.filter(Boolean),
      hiddenRules: hiddenRules.filter(Boolean),
    }
  }, [uid, segments, hiddenLines])

  const copyVisibleContent = () => {
    if (!editorRef.current) {
      return
    }

    const lines = editorRef.current.innerText.split('\n')
    const visibleLines = lines.filter((_, index) => !hiddenLines?.includes(index + 1))
    const content = visibleLines.join('\n')

    navigator.clipboard.writeText(content)
  }

  return (
    <div className={`group editor-container ${uid} flex relative`}>
      <button
        onClick={copyVisibleContent}
        className="absolute right-6 top-4 p-1 bg-indigo-100 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:bg-indigo-200 rounded-sm transition-all"
        title="copy full text"
      >
        <FeatherIcon icon="copy" className="h-4 w-4 text-indigo-900" />
      </button>

      <div className="flex-1 h-[500px] border rounded-b-md overflow-y-auto">
        <div className="flex min-h-full">
          <div className="shrink-0 bg-indigo-100 text-indigo-800 font-bold text-right select-none">
            {new Array(lineNumbers).fill(1).map((_, num) => (
              <div key={num} className="px-2 leading-[21px]" style={{ display: hiddenLines && hiddenLines.includes(num + 1) ? 'none' : undefined }}>
                {num + 1}
              </div>
            ))}
          </div>

          <style>
            {diffRules.length ? `${diffRules.join(',')}{background-color:rgb(251 207 232 / var(--tw-bg-opacity, 1));}` : ''}
            {hiddenRules.length ? `${hiddenRules.join(',')}{display:none;}` : ''}
          </style>

          <BaseEditor storageKey={storageKey} onChange={combineFuncs(onChange, setValue)} ref={editorRef} />
        </div>
      </div>
    </div>
  )
}
