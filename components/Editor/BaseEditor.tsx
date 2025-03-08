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

    const copySelectedText = () => {
      const selection = window.getSelection()
      const selectedText = selection?.toString()
      if (selectedText) {
        navigator.clipboard.writeText(selectedText)
      }
    }

    const copyVisibleContent = () => {
      if (!editorRef.current) {
        return
      }

      const selection = window.getSelection()
      const selectedText = selection?.toString()
      const content = selectedText || getText()
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

    const onPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault()

      if (!editorRef.current) {
        return
      }

      const fragment = document.createDocumentFragment()
      const selection = window.getSelection()
      const range = selection?.getRangeAt(0)

      if (!range) {
        return
      }

      // Delete selected content if any
      if (range.startOffset !== range.endOffset) {
        range.deleteContents()
      }

      const clipboardText = event.clipboardData.getData('text/plain')
      const lines = clipboardText.split('\n')
      const wrappedContents = lines.map((line) => {
        const div = document.createElement('div')
        div.textContent = line || '\u200B' // Use zero-width space to preserve empty lines
        return div
      })

      wrappedContents.forEach((div) => fragment.appendChild(div))
      range.insertNode(fragment)

      const { innerText, innerHTML } = editorRef.current
      const text = innerText.replaceAll('\n\n', '\n')
      onChange(text, innerHTML)

      if (storageKey) {
        localStorage.setItem(storageKey, innerHTML)
      }
    }

    const onResize = () => {
      if (!editorRef.current) {
        return
      }

      const clientHeight = editorRef.current.clientHeight
      setHiehgt(clientHeight)
    }

    /** Handle backspace key press event */
    const handleBackspace = (event: React.KeyboardEvent<HTMLElement>, selection: Selection) => {
      if (!selection || !editorRef.current) {
        return
      }

      if (selection.rangeCount === 0) {
        return
      }

      const range = selection.getRangeAt(0)
      if (!range) {
        return
      }

      if (range.startOffset === range.endOffset) {
        return
      }

      event.preventDefault()

      const fragment = document.createDocumentFragment()
      fragment.appendChild(range.cloneContents())

      range.deleteContents()

      const { innerHTML: html, innerText } = editorRef.current
      const text = innerText.replaceAll('\n\n', '\n')
      onChange(text, html)
    }

    /** Handle copy command (Ctrl/Cmd + C) */
    const handleCopy = (event: React.KeyboardEvent<HTMLElement>) => {
      event.preventDefault()
      copySelectedText()
    }

    /** Handle cut command (Ctrl/Cmd + X) */
    const handleCut = (event: React.KeyboardEvent<HTMLElement>) => {
      event.preventDefault()
      copySelectedText()
      handleBackspace(event, window.getSelection()!)
    }

    /** Handle save command (Ctrl/Cmd + S) */
    const handleSave = (event: React.KeyboardEvent<HTMLElement>) => {
      event.preventDefault()
      saveCache()
    }

    /** Handle undo command (Ctrl/Cmd + Z) */
    const handleUndo = (event: React.KeyboardEvent<HTMLElement>) => {
      event.preventDefault()
      loadCache()
    }

    /** Get the direct child node of editor */
    const getEditorChildNode = (node: Node | null): HTMLElement | null => {
      if (!node || !editorRef.current) {
        return null
      }

      // First check if the node itself is a direct child of the editor
      if (node instanceof HTMLElement && node.parentElement === editorRef.current) {
        return node
      }

      // If not, traverse up through parent nodes
      let current = node.parentElement
      while (current) {
        if (current.parentElement === editorRef.current) {
          return current
        }
        current = current.parentElement
      }

      return null
    }

    /** Handle tab key press event */
    const handleTab = (event: React.KeyboardEvent<HTMLElement>, selection: Selection) => {
      event.preventDefault()
      event.stopPropagation()

      if (!selection || !editorRef.current) {
        return
      }

      const range = selection.getRangeAt(0)
      if (!range) {
        return
      }

      // If no text is selected, insert two spaces at cursor position
      if (range.collapsed) {
        const textNode = document.createTextNode('  ')
        range.insertNode(textNode)
        range.setStartAfter(textNode)
        range.setEndAfter(textNode)
        selection.removeAllRanges()
        selection.addRange(range)

        const { innerHTML: html, innerText } = editorRef.current
        const text = innerText.replaceAll('\n\n', '\n')
        onChange(text, html)
        return
      }

      // Get start and end nodes of selected content
      const startNode = getEditorChildNode(range.startContainer)
      const endNode = getEditorChildNode(range.endContainer)
      if (!startNode || !endNode) {
        return
      }

      // Get all lines that need indentation
      const lines: Element[] = []
      let currentNode: Element | null = startNode
      while (currentNode && currentNode !== endNode.nextElementSibling) {
        if (currentNode.parentElement === editorRef.current) {
          lines.push(currentNode)
        }

        currentNode = currentNode.nextElementSibling
      }

      // Add indentation to each line
      lines.forEach((line) => {
        const text = line.textContent || ''
        line.textContent = '  ' + text
      })

      const newRange = document.createRange()
      newRange.setStart(startNode.firstChild!, 0)
      newRange.setEnd(endNode.firstChild!, endNode.firstChild!.textContent!.length)

      const startTime = Date.now()
      const checkSelection = () => {
        if (Date.now() - startTime > 2000) {
          return
        }

        if (selection.rangeCount === 0) {
          requestAnimationFrame(checkSelection)
          return
        }

        const range = selection.getRangeAt(0)
        if (
          range.startContainer !== newRange.startContainer ||
          range.endContainer !== newRange.endContainer ||
          range.startOffset !== newRange.startOffset ||
          range.endOffset !== newRange.endOffset
        ) {
          selection.removeAllRanges()
          selection.addRange(newRange)
          requestAnimationFrame(checkSelection)
          return
        }
      }

      requestAnimationFrame(checkSelection)
    }

    /** Handle keyboard events */
    const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
      if (event.key === 'Tab') {
        handleTab(event, window.getSelection()!)
        return
      }

      if (event.key === 'Backspace') {
        handleBackspace(event, window.getSelection()!)
        return
      }

      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'c') {
          handleCopy(event)
          return
        }

        if (event.key === 'x') {
          handleCut(event)
          return
        }

        if (event.key === 'a') {
          return
        }

        if (event.key === 's' && storageKey) {
          handleSave(event)
          return
        }

        if (event.key === 'z') {
          handleUndo(event)
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
