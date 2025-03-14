'use client'

import { useCallback } from 'react'
import type { EditorView } from '@codemirror/view'

export interface UseStorageOptions {
  /** Key for storing editor content in localStorage */
  storageKey?: string
  /** Editor view reference */
  editorRef: React.RefObject<EditorView | null>
}

export function useStorage({ storageKey, editorRef }: UseStorageOptions) {
  const getValue = useCallback(() => {
    if (!editorRef.current) {
      return ''
    }

    const { state } = editorRef.current
    return state.doc.toString()
  }, [editorRef])

  const setValue = useCallback(
    (value: string) => {
      if (!editorRef.current || !value) {
        return
      }

      const editor = editorRef.current
      const { state } = editor
      const doc = state.doc
      const currentValue = doc.toString()

      if (currentValue === value) {
        return
      }

      editorRef.current?.dispatch({
        changes: {
          from: 0,
          to: doc.length,
          insert: value,
        },
      })
    },
    [editorRef]
  )

  const saveToStorage = useCallback(() => {
    if (!storageKey || !editorRef.current) {
      return false
    }

    const content = getValue()
    localStorage.setItem(storageKey, content)
    return true
  }, [storageKey, getValue])

  const loadFromStorage = useCallback(() => {
    if (!storageKey || !editorRef.current) {
      return false
    }

    const content = localStorage.getItem(storageKey)
    content && setValue(content)
    return true
  }, [storageKey, setValue])

  return {
    getValue,
    setValue,
    saveToStorage,
    loadFromStorage,
  }
}
