// 'use client'

// import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
// import { debounce } from 'lodash'
// import BaseEditor, { type BaseEditorRef } from './BaseEditor'
// import { Style } from './Style'

// interface VirtualLine {
//   index: number
//   content: string
//   height: number
//   top: number
// }

// interface EditorV2Props {
//   value?: string
//   onChange?: (value: string) => void
//   storageKey?: string
//   disabled?: boolean
//   lineHeight?: number
//   overscanCount?: number
// }

// export default function EditorV2(props: EditorV2Props) {
//   const {
//     value = '',
//     onChange,
//     storageKey,
//     disabled,
//     lineHeight = 21, // 默认行高
//     overscanCount = 5, // 上下额外渲染的行数
//   } = props

//   const containerRef = useRef<HTMLDivElement>(null)
//   const editorRef = useRef<BaseEditorRef>(null)
//   const [scrollTop, setScrollTop] = useState(0)
//   const [containerHeight, setContainerHeight] = useState(0)
  
//   // 将文本分割成行，并计算每行的位置信息
//   const lines = useMemo(() => {
//     const textLines = value.split('\n')
//     let currentTop = 0
//     return textLines.map((content, index) => {
//       const line: VirtualLine = {
//         index,
//         content: content || '\u200B', // 使用零宽空格保持空行
//         height: lineHeight,
//         top: currentTop
//       }
//       currentTop += lineHeight
//       return line
//     })
//   }, [value, lineHeight])

//   // 计算总高度
//   const totalHeight = lines.length * lineHeight

//   // 计算可见区域的行范围
//   const visibleRange = useMemo(() => {
//     const startIndex = Math.max(0, Math.floor(scrollTop / lineHeight) - overscanCount)
//     const endIndex = Math.min(
//       lines.length,
//       Math.ceil((scrollTop + containerHeight) / lineHeight) + overscanCount
//     )
//     return { startIndex, endIndex }
//   }, [scrollTop, containerHeight, lineHeight, lines.length, overscanCount])

//   // 获取可见行的内容
//   const visibleLines = useMemo(() => {
//     return lines.slice(visibleRange.startIndex, visibleRange.endIndex)
//   }, [lines, visibleRange])

//   // 处理滚动事件
//   const handleScroll = useCallback(
//     debounce((e: React.UIEvent<HTMLDivElement>) => {
//       setScrollTop(e.currentTarget.scrollTop)
//     }, 10),
//     []
//   )

//   // 监听容器大小变化
//   useEffect(() => {
//     if (!containerRef.current) return

//     const resizeObserver = new ResizeObserver((entries) => {
//       for (const entry of entries) {
//         setContainerHeight(entry.contentRect.height)
//       }
//     })

//     resizeObserver.observe(containerRef.current)
//     return () => resizeObserver.disconnect()
//   }, [])

//   // 更新编辑器内容
//   const updateEditorContent = useCallback(() => {
//     if (!editorRef.current) return

//     const visibleContent = visibleLines
//       .map(line => `<div>${line.content}</div>`)
//       .join('')

//     editorRef.current.setHtml(visibleContent)
//   }, [visibleLines])

//   // 当可见行变化时更新编辑器内容
//   useEffect(() => {
//     updateEditorContent()
//   }, [updateEditorContent])

//   return (
//     <div className="h-full flex relative editor-container">
//       <div className="flex-1 border rounded-b-md overflow-y-scroll" ref={containerRef} onScroll={handleScroll}>
//         <div className="flex min-h-full">
//           <div className="shrink-0 bg-indigo-100 text-indigo-800 font-bold text-right select-none">
//             {visibleLines.map(line => (
//               <div key={line.index} className="px-2" style={{ height: lineHeight }}>
//                 {line.index + 1}
//               </div>
//             ))}
//           </div>

//           <div style={{ height: totalHeight, position: 'relative' }}>
//             <div style={{ position: 'absolute', top: visibleRange.startIndex * lineHeight }}>
//               <BaseEditor
//                 ref={editorRef}
//                 disabled={disabled}
//                 storageKey={storageKey}
//                 onChange={(text) => onChange?.(text)}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }