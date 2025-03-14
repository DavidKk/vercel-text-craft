'use client'

import { useEffect, useMemo, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { StateField, EditorState } from '@codemirror/state'
import { EditorView, Decoration, keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import type { Range } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import Container from './Container'
import { useStorage } from './hooks/useStorage'

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
  const editorRef = useRef<EditorView>(null)
  const highlightLinesRef = useRef<number[]>([])

  const { setValue, saveToStorage, loadFromStorage } = useStorage({
    storageKey,
    editorRef,
  })

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer?.files || [])
    if (files.length === 0) return

    const file = files[0]
    // 10MB size limit
    if (file.size > 10 * 1024 * 1024) return

    try {
      // Check if file is text
      const isText = file.type.startsWith('text/') || ['application/json', 'application/xml', 'application/javascript'].includes(file.type)
      if (!isText) return

      const content = await file.text()
      setValue(content)
    } catch (err) {
      console.error('Failed to read file:', err)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.addEventListener('drop', handleDrop)
    container.addEventListener('dragover', handleDragOver)

    return () => {
      container.removeEventListener('drop', handleDrop)
      container.removeEventListener('dragover', handleDragOver)
    }
  }, [])

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

    const keymapExtenstion = keymap.of([
      indentWithTab,
      {
        mac: 'Cmd-s',
        win: 'Ctrl-s',
        linux: 'Ctrl-s',
        preventDefault: true,
        run: () => {
          saveToStorage()
          return true
        },
      },
    ])

    const startState = EditorState.create({
      doc: value || '',
      extensions: [
        basicSetup,
        decorationField,
        keymapExtenstion,
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

    return () => {
      view.destroy()
    }
  }, [])

  useEffect(() => {
    loadFromStorage()
  }, [])

  useEffect(() => {
    setValue(value || '')
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
