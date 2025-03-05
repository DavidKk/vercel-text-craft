'use client'

import React, { useEffect, useImperativeHandle, useRef } from 'react'

export interface BaseEditorProps {
  /** Key for storing editor content in localStorage */
  storageKey?: string
  /** Callback function when editor content or HTML changes */
  onChange: (text: string, html: string) => void
  /** Whether the editor is disabled */
  disabled?: boolean
}

export interface BaseEditorRef {
  saveCache: () => void
  getText: () => string
  getHtml: () => string
  setHtml: (html: string) => void
}

export default React.memo(
  React.forwardRef<BaseEditorRef, BaseEditorProps>((props, ref) => {
    const { storageKey, onChange, disabled } = props
    const editorRef = useRef<HTMLDivElement>(null)

    const onInput: React.FormEventHandler<HTMLDivElement> = () => {
      if (!editorRef.current) {
        return
      }

      const { innerHTML: html, innerText } = editorRef.current
      const text = innerText.replaceAll('\n\n', '\n')

      onChange(text, html)
      storageKey && localStorage.setItem(storageKey, html)
    }

    const onPaste: React.ClipboardEventHandler<HTMLDivElement> = () => {
      setTimeout(() => {
        if (!editorRef.current) {
          return
        }

        const text = editorRef.current.innerText
        if (!text) {
          return
        }

        const lines = text.split('\n')
        const wrappedContents = lines.map((line) => `<div>${line}</div>`)
        editorRef.current.innerHTML = wrappedContents.join('')

        const { innerText, innerHTML } = editorRef.current
        onChange(innerText, innerHTML)

        if (storageKey) {
          localStorage.setItem(storageKey, innerHTML)
        }
      })
    }

    const saveCache = () => {
      if (!(storageKey && editorRef.current)) {
        return
      }

      const { innerHTML } = editorRef.current
      localStorage.setItem(storageKey, innerHTML)
    }

    const getText = () => {
      if (!editorRef.current) {
        return ''
      }

      const { innerHTML } = editorRef.current
      return innerHTML
    }

    const getHtml = () => {
      if (!editorRef.current) {
        return ''
      }

      const { innerText } = editorRef.current
      return innerText
    }

    const setHtml = (html: string) => {
      if (!editorRef.current) {
        return
      }

      editorRef.current.innerHTML = html
      saveCache()
    }

    useImperativeHandle(ref, () => ({ saveCache, getText, getHtml, setHtml }))

    useEffect(() => {
      if (!(storageKey && editorRef.current)) {
        return
      }

      const savedContent = localStorage.getItem(storageKey)
      if (!savedContent) {
        return
      }

      editorRef.current.innerHTML = savedContent

      const { innerText, innerHTML } = editorRef.current
      onChange(innerText, innerHTML)
    }, [storageKey])

    return (
      <>
        <style>{`.editor>div{width:100%;padding-inline:10px;white-space:pre;}.editor.disabled{pointer-events:none;opacity:0.7}`}</style>
        <div
          className="editor w-full overflow-x-auto flex-1 outline-none whitespace-pre leading-[21px]"
          ref={editorRef}
          onInput={onInput}
          onPaste={onPaste}
          contentEditable={disabled ? false : true}
          aria-disabled={disabled ? 'true' : undefined}
        />
      </>
    )
  }),
  () => true
)
