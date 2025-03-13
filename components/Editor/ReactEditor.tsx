'use client'

import React, { useMemo, useId, useEffect } from 'react'
import FeatherIcon from 'feather-icons-react'
import { isJson } from '@/utils/json'
import { isToml } from '@/utils/toml'
import Codemirror, { type CodemirrorProps } from './Codemirror'
import type { TextSegment } from './types'

export type { TextSegment } from './types'

export interface ReactEditorProps extends CodemirrorProps {
  /** Array of text segments to be displayed in the editor */
  segments?: TextSegment[]
}

export default function ReactEditor(props: ReactEditorProps) {
  const { value, onChange, segments, storageKey, disabled, hiddenLines } = props

  const rawUid = useId()
  const uid = useMemo(() => `${rawUid.replace(/[^a-zA-Z0-9]/g, '')}`, [rawUid])

  const copyVisibleContent = () => {
    navigator.clipboard.writeText(value || '')
  }

  const highlightLines = useMemo(() => {
    if (!(Array.isArray(segments) && segments.length)) {
      return
    }

    const lines: number[] = []
    for (const { isPresent, startLine, endLine, ignoredLines = [] } of segments) {
      if (isPresent) {
        continue
      }

      for (let line = startLine; line <= endLine; line++) {
        if (ignoredLines.includes(line)) {
          continue
        }

        lines.push(line)
      }
    }

    return lines
  }, [segments])

  return (
    <div className={`h-full group editor-container ${uid} flex relative`}>
      <button
        onClick={copyVisibleContent}
        className="absolute z-10 right-5 top-1 p-1 bg-indigo-100 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:bg-indigo-200 rounded-sm transition-all"
        title="copy full text"
      >
        <FeatherIcon icon="copy" className="h-4 w-4 text-indigo-900" />
      </button>

      <span className="select-none text-xs font-extrabold text-indigo-600 absolute z-10 right-5 bottom-5 p-1 bg-indigo-100 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-indigo-200 rounded-sm transition-all">
        {!value ? 'TEXT' : isJson(value) ? 'JSON' : isToml(value) ? 'TOML' : 'TEXT'}
      </span>

      <Codemirror value={value} onChange={onChange} storageKey={storageKey} disabled={disabled} highlightLines={highlightLines} hiddenLines={hiddenLines} />
    </div>
  )
}
