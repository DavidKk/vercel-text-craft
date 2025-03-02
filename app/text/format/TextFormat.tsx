'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from 'ahooks'
import ReactEditor from '@/components/Editor/ReactEditor'
import FormatTabs, { type FormatType } from './FormatTabs'
import { formatText } from './utils'

export interface FormatResult {
  success: boolean
  result: string
  error?: string
}

export default function TextFormat() {
  const [sourceText, setSourceText] = useState('')
  const [formattedText, setFormattedText] = useState('')
  const [targetFormat, setTargetFormat] = useState<FormatType>('json')
  const debouncedText = useDebounce(sourceText, { wait: 300 })

  useEffect(() => {
    if (debouncedText) {
      formatText(debouncedText, targetFormat).then(setFormattedText)
    }
  }, [debouncedText, targetFormat])

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-end">
        <FormatTabs value={targetFormat} onChange={setTargetFormat} />
      </div>

      <div className="flex gap-1 w-full min-h-[500px] h-[70vh]">
        <div className="w-1/2">
          <ReactEditor segments={[]} onChange={setSourceText} storageKey="text-format-source" />
        </div>

        <div className="w-1/2">
          <ReactEditor value={formattedText} segments={[]} onChange={setSourceText} />
        </div>
      </div>
    </div>
  )
}
