'use client'

import React, { useEffect, useImperativeHandle, useRef } from 'react'

export interface BaseEditorProps {
  /** Key for storing editor content in localStorage */
  storageKey?: string
  /** Callback function when editor content or HTML changes */
  onChange: (text: string, html: string) => void
}

export default React.memo(
  React.forwardRef<HTMLDivElement, BaseEditorProps>((props, ref) => {
    const { storageKey, onChange } = props
    const editorRef = useRef<HTMLDivElement>(null)

    const onInput: React.FormEventHandler<HTMLDivElement> = () => {
      if (!editorRef.current) {
        return
      }

      const text = editorRef.current.innerText
      const html = editorRef.current.innerHTML
      if (text) {
        onChange(text, html)
      }

      if (storageKey) {
        localStorage.setItem(storageKey, html)
      }
    }

    const onPaste = () => {
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

    useImperativeHandle(ref, () => editorRef.current!)

    return (
      <>
        <style>{`.editor > div{display:table;padding-inline: 10px} .editor.disabled{pointer-events:none;opacity:0.7}`}</style>
        <div
          className={`editor w-full overflow-x-auto flex-1 outline-none whitespace-pre leading-[21px]`}
          ref={editorRef}
          onInput={onInput}
          onPaste={onPaste}
          contentEditable="true"
        />
      </>
    )
  }),
  () => true
)
