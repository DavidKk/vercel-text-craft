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
  copyVisibleContent: () => void
}

export default React.memo(
  React.forwardRef<BaseEditorRef, BaseEditorProps>((props, ref) => {
    const { storageKey, onChange, disabled } = props
    const editorRef = useRef<HTMLDivElement>(null)

    const copyVisibleContent = () => {
      if (!editorRef.current) {
        return
      }

      const content = getText()
      navigator.clipboard.writeText(content)
    }

    const loadCache = () => {
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

    useImperativeHandle(ref, () => ({ saveCache, getText, getHtml, setHtml, getElement, copyVisibleContent }))

    const onInput: React.FormEventHandler<HTMLDivElement> = () => {
      if (!editorRef.current) {
        return
      }

      const { innerHTML: html, innerText } = editorRef.current
      const text = innerText.replaceAll('\n\n', '\n')

      onChange(text, html)
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

    const onResize = () => {
      if (!editorRef.current) {
        return
      }

      const clientHeight = editorRef.current.clientHeight
      setHiehgt(clientHeight)
    }

    const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
      if (event.key === 'Backspace') {
        const selection = window.getSelection()
        if (!selection || !editorRef.current) {
          return
        }

        const range = selection.getRangeAt(0)
        if (!range) {
          return
        }

        event.preventDefault()

        const fragment = document.createDocumentFragment()
        fragment.appendChild(range.cloneContents())

        range.deleteContents()

        const { innerHTML: html, innerText } = editorRef.current
        const text = innerText.replaceAll('\n\n', '\n')
        onChange(text, html)
        return
      }

      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'c') {
          event.preventDefault()
          copyVisibleContent()
          return
        }

        if (event.key === 'a') {
          return
        }

        if (event.key === 's' && storageKey) {
          event.preventDefault()
          saveCache()
          return
        }

        if (event.key === 'z') {
          event.preventDefault()
          loadCache()
          return
        }
      }

      if (disabled) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
    }

    useEffect(() => {
      loadCache()
    }, [])

    const [height, setHiehgt] = useState<number>()
    useEffect(() => {
      onResize()
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
          onKeyDown={onKeyDown}
          onResize={onResize}
          contentEditable={true}
          aria-disabled={disabled ? 'true' : undefined}
        />
      </>
    )
  }),
  (prev, next) => {
    if (prev.disabled !== next.disabled) {
      return false
    }

    return true
  }
)
