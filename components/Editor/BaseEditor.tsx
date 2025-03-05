'use client'

import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'

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
  getElement: () => HTMLDivElement | null
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

    const onResize: React.ReactEventHandler<HTMLElement> = () => {
      if (!editorRef.current) {
        return
      }

      const clientHeight = editorRef.current.clientHeight
      setHiehgt(clientHeight)
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

      const { innerText } = editorRef.current
      return innerText
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

    const getElement = () => {
      return editorRef.current
    }

    useImperativeHandle(ref, () => ({ saveCache, getText, getHtml, setHtml, getElement }))

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

    const [height, setHiehgt] = useState<number>()
    useEffect(() => {
      if (!editorRef.current) {
        return
      }

      const clientHeight = editorRef.current.clientHeight
      setHiehgt(clientHeight)
    }, [])

    return (
      <>
        <style>{`.editor>div{width:100%;padding-inline:10px;white-space:pre;scroll-snap-align:start;}.editor.disabled{pointer-events:none;opacity:0.7}`}</style>
        <div
          className="editor content-visibility-auto will-change-transform contain-strict w-full overflow-x-scroll overflow-y-hidden flex-1 outline-none whitespace-pre leading-[21px]"
          style={height ? { containIntrinsicSize: `${height ? `${height}px` : undefined}` } : {}}
          ref={editorRef}
          onInput={onInput}
          onPaste={onPaste}
          onResize={onResize}
          contentEditable={disabled ? false : true}
          aria-disabled={disabled ? 'true' : undefined}
        />
      </>
    )
  }),
  () => true
)
