'use client'

import React, { useMemo, useState, useRef } from 'react'
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
}

export default function ReactEditor(props: ReactEditorProps) {
  const { onChange, segments, storageKey } = props
  const editorRef = useRef<HTMLDivElement>(null)
  const [internalValue, setValue] = useState<string>('')
  const lineNumbers = useMemo(() => internalValue.split('\n').length + 1, [internalValue])
  const styles = segments.map(({ isPresent }, index) => (!isPresent ? `.editor-container.${storageKey} .editor > div:nth-child(${index + 1})` : '')).filter(Boolean)

  return (
    <div className={`editor-container ${storageKey} flex`}>
      <div className="flex-1 h-[500px] border rounded-b-md overflow-y-auto">
        <div className="flex min-h-full">
          <div className="shrink-0 bg-indigo-100 text-indigo-800 font-bold text-right select-none">
            {new Array(lineNumbers).fill(1).map((_, num) => (
              <div key={num} className="px-2 leading-[21px]">
                {num + 1}
              </div>
            ))}
          </div>

          <style>{styles.length ? `${styles.join(',')}{background-color:rgb(251 207 232 / var(--tw-bg-opacity, 1));}` : ''}</style>
          <BaseEditor storageKey={storageKey} onChange={combineFuncs(onChange, setValue)} ref={editorRef} />
        </div>
      </div>
    </div>
  )
}
