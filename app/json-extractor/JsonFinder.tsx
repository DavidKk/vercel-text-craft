'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from 'ahooks'
import ReactEditor from '@/components/Editor/ReactEditor'
import FormatTabs from '@/components/FormatTabs'
import { detectDominantQuote, extractAllStrings } from './string'
import { MOCK_STRING } from './mock-data'

type FormatType = 'json' | 'toml' | 'yaml'

const FINDER_FORMAT_TYPES = ['json', 'toml', 'yaml'] as const satisfies FormatType[]

export default function JsonFinder() {
  const [sourceText, setSourceText] = useState('')
  const [formattedTexts, setFormattedTexts] = useState<string[]>([])
  const [targetFormat, setTargetFormat] = useState<FormatType>('json')
  const debouncedText = useDebounce(sourceText, { wait: 300 })

  const handleMockData = () => {
    setSourceText(MOCK_STRING)
  }

  const handleFormat = async () => {
    if (!debouncedText) {
      return
    }

    const quote = detectDominantQuote(debouncedText)
    const fixedText = [debouncedText, `${quote}${debouncedText}`, `${debouncedText}${quote}`]

    for (const text of fixedText) {
      const jsonStrings = extractAllStrings(text)
      const formattedStrings: string[] = []
      for (const jsonString of jsonStrings) {
        try {
          const parsed = JSON.parse(jsonString)
          if (typeof parsed !== 'object') {
            continue
          }

          const formatted = JSON.stringify(parsed, null, 2)
          formattedStrings.push(formatted)
        } catch {}
      }

      if (formattedStrings.length) {
        setFormattedTexts(formattedStrings)
        break
      }
    }
  }

  useEffect(() => {
    handleFormat()
  }, [debouncedText, targetFormat])

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <button className="px-3 py-1 text-xs rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50" onClick={handleMockData}>
          Try JSON
        </button>

        <FormatTabs value={targetFormat} onChange={setTargetFormat} types={FINDER_FORMAT_TYPES} />
      </div>

      <div className="flex gap-1 w-full min-h-[500px] h-[70vh]">
        <div className="w-1/2">
          <ReactEditor value={sourceText} onChange={setSourceText} storageKey="json-finder-source" />
        </div>

        <div className="w-1/2 flex flex-col h-full">
          <ReactEditor value={formattedTexts.join('\n')} disabled />
        </div>
      </div>
    </div>
  )
}
