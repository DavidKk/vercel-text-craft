'use client'

import { useEffect, useMemo, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { StateField, EditorState } from '@codemirror/state'
import { EditorView, Decoration } from '@codemirror/view'
import type { Range } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import useStorage from './hooks/useStorage'
import useDrop from './hooks/useDrop'
import Container from './Container'
import { getEditorValue, setEditorValue } from './utils'

export interface CodemirrorProps {
  value?: string
  /** Callback function when editor content changes */
  onChange?: (value: string) => void
  /** Whether the editor is disabled */
  disabled?: boolean
  /** Key for storing editor content in localStorage */
  storageKey?: string
  /** Array of line numbers to be highlighted, if empty or undefined no lines will be highlighted */
  highlightLines?: number[]
  /** Array of line numbers to be hidden, if empty or undefined all lines will be visible */
  hiddenLines?: number[]
  /** Whether to disable styling */
  noStyle?: boolean
}

export default function Codemirror(props: CodemirrorProps) {
  const { value, onChange, disabled, highlightLines, hiddenLines, storageKey, noStyle } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorView | null>(null)
  const highlightLinesRef = useRef<number[]>([])

  const { extensions, setEditor: setStorageEditor } = useStorage({ storageKey, disabled })
  const { setEditor: setDropEditor } = useDrop({ disabled })

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const hightlightDecoration = Decoration.line({
      attributes: {
        class: 'bg-red-100',
      },
    })

    const decorationField = StateField.define<DecorationSet>({
      create: () => Decoration.none,
      update(_, tr) {
        const highlightLines = highlightLinesRef.current || []

        const hightlightDecorations: Range<Decoration>[] = []
        highlightLines.forEach((line) => {
          if (tr.state.doc.lines <= line) {
            return
          }

          const pos = tr.state.doc.line(line)
          const range = hightlightDecoration.range(pos.from, pos.from)
          hightlightDecorations.push(range)
        })

        return Decoration.set(hightlightDecorations, true)
      },
      provide: (f) => EditorView.decorations.from(f),
    })

    const startState = EditorState.create({
      doc: value || '',
      extensions: [
        basicSetup,
        decorationField,
        ...extensions,
        EditorView.editable.of(!disabled),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) {
            return
          }

          const newValue = update.state.doc.toString()
          onChange?.(newValue)
        }),
      ],
    })

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    })

    editorRef.current = view
    setStorageEditor(view)
    setDropEditor(view)

    return () => {
      view.destroy()
    }
  }, [extensions])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    setEditorValue(editor, value || '')
  }, [value])

  useEffect(() => {
    highlightLinesRef.current = highlightLines || []
    editorRef.current?.dispatch({ changes: [] })
  }, [highlightLines])

  const visiableContent = useMemo(() => {
    if (!editorRef.current || !hiddenLines?.length) {
      return ''
    }

    const lines = editorRef.current.state.doc.toString().split('\n')
    return lines.filter((content, index) => !hiddenLines.includes(index + 1) && content.trim()).join('\n')
  }, [hiddenLines])

  return (
    <Container noStyle={noStyle}>
      <div ref={containerRef} className={`flex-1 overflow-y-auto ${visiableContent ? 'hidden' : ''}`} />
      {visiableContent ? <Codemirror value={visiableContent} disabled noStyle /> : null}
    </Container>
  )
}
