'use client'

import React, { useMemo, useState, useRef, useId, useEffect } from 'react'
import FeatherIcon from 'feather-icons-react'
import { combineFuncs } from '@/utils/func'
import { isJson } from '@/utils/json'
import { isToml } from '@/utils/toml'
import BaseEditor, { type BaseEditorRef } from './BaseEditor'
import { Style } from './Style'

export interface TextPosition {
  /** Start line number of the text */
  startLine: number
  /** End line number of the text */
  endLine: number
  /** Start column number of the text in the line */
  startColumn: number
  /** End column number of the text in the line */
  endColumn: number
}

export interface TextSegmentPosition extends TextPosition {
  /** The text contents of the segment */
  texts: string[]
}

export interface TextSegment extends TextSegmentPosition {
  /** Whether this segment is present in the comparison text */
  isPresent: boolean
  /** Optional array of line numbers where this segment matches */
  matchingLines?: number[]
  /** Array of line numbers that are ignored due to overlapping with other segments */
  ignoredLines?: number[]
}

export interface ReactEditorProps {
  value?: string
  /** Array of text segments to be displayed in the editor */
  segments?: TextSegment[]
  /** Key for storing editor content in localStorage */
  storageKey?: string
  /** Callback function when editor content changes */
  onChange?: (value: string) => void
  /** Array of line numbers to be hidden, if empty or undefined all lines will be visible */
  hiddenLines?: number[]
  /** Whether the editor is disabled */
  disabled?: boolean
}

export default function ReactEditor(props: ReactEditorProps) {
  const { value, onChange, segments, storageKey, hiddenLines, disabled } = props

  const rawUid = useId()
  const uid = useMemo(() => `${rawUid.replace(/[^a-zA-Z0-9]/g, '')}`, [rawUid])
  const editorRef = useRef<BaseEditorRef>(null)
  const [internalValue, setValue] = useState<string>('')
  const lineNumbers = useMemo(() => internalValue.split('\n').length + 1, [internalValue])
  const diffLines = useMemo(() => {
    const diffLines: number[] = []
    segments?.forEach(({ isPresent, startLine, endLine, ignoredLines = [] }) => {
      if (isPresent) {
        return
      }

      for (let line = startLine; line <= endLine; line++) {
        if (ignoredLines.includes(line)) {
          continue
        }

        diffLines.push(line)
      }
    })

    return diffLines
  }, [segments])

  const copyVisibleContent = () => {
    if (!editorRef.current) {
      return
    }

    editorRef.current.copyVisibleContent()
  }

  const setText = (value?: string) => {
    if (!editorRef.current) {
      return
    }

    if (typeof value !== 'string') {
      value = ''
    }

    const html = value
      .split('\n')
      .map((item) => `<div>${item || '<br/>'}</div>`)
      .join('')

    editorRef.current.setHtml(html)
    setValue(value)
  }

  const replaceText = (value: string) => {
    if (value === internalValue) {
      return
    }

    let startContainer: Node | undefined
    let range: Range | undefined
    let startOffset: number | undefined

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0)
      startContainer = range?.startContainer
      startOffset = range?.startOffset
    }

    setText(value)

    if (startContainer && range) {
      const newRange = document.createRange()
      newRange.setStart(startContainer, startOffset!)
      selection?.removeAllRanges()
      selection?.addRange(newRange)
    }
  }

  useEffect(() => {
    replaceText(value || '')
  }, [value])

  return (
    <div className={`h-full group editor-container ${uid} flex relative`}>
      <button
        onClick={copyVisibleContent}
        className="absolute z-10 right-5 top-2 p-1 bg-indigo-100 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:bg-indigo-200 rounded-sm transition-all"
        title="copy full text"
      >
        <FeatherIcon icon="copy" className="h-4 w-4 text-indigo-900" />
      </button>

      <span className="select-none text-xs font-extrabold text-indigo-600 absolute z-10 right-5 bottom-2 p-1 bg-indigo-100 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-indigo-200 rounded-sm transition-all">
        {isJson(internalValue) ? 'JSON' : isToml(internalValue) ? 'TOML' : 'TEXT'}
      </span>

      <div className="flex-1 border rounded-b-md overflow-y-scroll">
        <div className="flex min-h-full">
          <div className="shrink-0 bg-indigo-100 text-indigo-800 font-bold text-right select-none">
            {new Array(lineNumbers).fill(1).map((_, num) => (
              <div key={num} className="px-2 leading-[21px]" style={{ display: hiddenLines && hiddenLines.includes(num + 1) ? 'none' : undefined }}>
                {num + 1}
              </div>
            ))}
          </div>

          <Style prefix={`.${uid} .editor > div`} lines={diffLines} style="background-color:rgba(251,207,232,.5);" />
          <Style prefix={`.${uid} .editor > div`} lines={hiddenLines} style="display:none;" />
          <BaseEditor disabled={disabled} storageKey={storageKey} onChange={combineFuncs(onChange, setValue)} ref={editorRef} />
        </div>
      </div>
    </div>
  )
}
