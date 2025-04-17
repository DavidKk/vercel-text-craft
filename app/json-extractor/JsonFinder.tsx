'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from 'ahooks'
import ReactEditor from '@/components/Editor/ReactEditor'
import FormatTabs from '@/components/FormatTabs'
import Tabs from '@/components/Tabs'
import { detectDominantQuote, extractAllStrings } from './string'
import { MOCK_STRING } from './mock-data'
import { formatText } from './utils'

type FormatType = 'json' | 'toml' | 'yaml'

const FINDER_FORMAT_TYPES = ['json', 'toml', 'yaml'] as const satisfies FormatType[]

export default function JsonFinder() {
  const [sourceText, setSourceText] = useState('')
  const [formattedTexts, setFormattedTexts] = useState<string[]>([])
  const [targetFormat, setTargetFormat] = useState<FormatType>('json')
  const [activeTabKey, setActiveTabKey] = useState(0)
  const debouncedText = useDebounce(sourceText, { wait: 300 })

  const handleMockData = () => {
    setSourceText(MOCK_STRING)
  }

  const extractJson = () => {
    if (!debouncedText) {
      return []
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
        return formattedStrings
      }
    }

    return []
  }

  useEffect(() => {
    const formattedStrings = extractJson()
    if (activeTabKey >= formattedStrings?.length) {
      setActiveTabKey(0)
    }

    setFormattedTexts(formattedStrings)
  }, [debouncedText])

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <button className="px-3 py-1 whitespace-nowrap text-xs rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50" onClick={handleMockData}>
          Try JSON
        </button>

        <FormatTabs value={targetFormat} onChange={setTargetFormat} types={FINDER_FORMAT_TYPES} />
      </div>

      <div className="flex flex-col md:flex-row gap-1 w-full md:min-h-[500px] md:h-[70vh]">
        <div className="w-full md:w-1/2 min-h-[250px] h-full">
          <ReactEditor
            title={<div className="flex items-center h-6 px-1">Content</div>}
            className="min-h-[70vh] md:min-h-[100%]"
            value={sourceText}
            onChange={setSourceText}
            storageKey="json-finder-source"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col h-full gap-1">
          {!formattedTexts?.length ? (
            <ReactEditor title={<div className="flex items-center h-6 px-1">Result</div>} className="min-h-[70vh] md:min-h-[100%]" disabled />
          ) : (
            <>
              <div className="flex items-center justify-between bg-indigo-100 p-1 rounded-md">
                <h1 className="text-xs font-bold select-none pl-2">Found {formattedTexts?.length} JSON</h1>
                <div className="flex">
                  <Tabs
                    items={formattedTexts.map((_, index) => ({
                      key: index.toString(),
                      label: `JSON ${index + 1}`,
                    }))}
                    activeKey={activeTabKey.toString()}
                    onChange={(key) => setActiveTabKey(parseInt(key))}
                  />
                </div>
              </div>

              <div className="overflow-y-auto h-full">
                <ReactEditor className="min-h-[70vh] md:min-h-[100%]" value={formatText(formattedTexts[activeTabKey], targetFormat)} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
