'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from 'ahooks'
import ReactEditor from '@/components/Editor/ReactEditor'
import FormatTabs from '@/components/FormatTabs'
import { formatText } from '../json-extractor/utils'
import { parseText } from '@/utils/parser'

type FormatType = 'json' | 'toml' | 'yaml' | 'properties'

const FINDER_FORMAT_TYPES = ['json', 'toml', 'yaml', 'properties'] as const satisfies FormatType[]

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
      const { type, data } = parseText(debouncedText)
      if (type != 'unknown') {
        const content = formatText(JSON.stringify(data), targetFormat)
        setFormattedText(content)
      } else {
        setFormattedText('')
      }
    }
  }, [debouncedText, targetFormat])

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-end">
        <FormatTabs value={targetFormat} onChange={setTargetFormat} types={FINDER_FORMAT_TYPES} />
      </div>

      <div className="flex flex-col md:flex-row gap-1 w-full md:min-h-[500px] md:h-[64vh]">
        <div className="w-full md:w-1/2 min-h-[250px] h-full">
          <ReactEditor title="Source" className="min-h-[64vh] md:min-h-[100%]" value={sourceText} onChange={setSourceText} storageKey="text-format-source" />
        </div>

        <div className="w-full md:w-1/2 min-h-[250px] h-full">
          <ReactEditor title="Formatted" className="min-h-[64vh] md:min-h-[100%]" value={formattedText} format={targetFormat} />
        </div>
      </div>
    </div>
  )
}
