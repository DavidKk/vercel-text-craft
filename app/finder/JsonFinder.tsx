'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from 'ahooks'
import ReactEditor from '@/components/Editor/ReactEditor'
import FormatTabs from '@/components/FormatTabs'
import { formatText } from './utils'

type FormatType = 'json' | 'toml' | 'yaml'

const FINDER_FORMAT_TYPES = ['json', 'toml', 'yaml'] as const satisfies FormatType[]

export default function JsonFinder() {
  const [sourceText, setSourceText] = useState('')
  const [formattedTexts, setFormattedTexts] = useState<string[]>([])
  const [targetFormat, setTargetFormat] = useState<FormatType>('json')
  const debouncedText = useDebounce(sourceText, { wait: 300 })

  const handleFormat = async () => {
    if (!debouncedText) {
      return
    }

    const jsonStrings = findJsonStrings(debouncedText)
    const formattedStrings: string[] = []
    for (const jsonString of jsonStrings) {
      try {
        const parsed = JSON.parse(jsonString)
        const formatted = JSON.stringify(parsed, null, 2)
        formattedStrings.push(formatted)
      } catch{}
    }

    setFormattedTexts(formattedStrings)
  }

  useEffect(() => {
    handleFormat()
  }, [debouncedText, targetFormat])

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-end">
        <FormatTabs value={targetFormat} onChange={setTargetFormat} types={FINDER_FORMAT_TYPES} />
      </div>

      <div className="flex gap-1 w-full min-h-[500px] h-[70vh]">
        <div className="w-1/2">
          <ReactEditor onChange={setSourceText} storageKey="json-finder-source" />
        </div>

        <div className="w-1/2 flex flex-col h-full">
          {formattedTexts.map((text, index) => (
            <pre className="bg-gray-200 p-2 text-xs overflow-auto" key={index}>
              {formatText(text, targetFormat)}
            </pre>
          ))}
        </div>
      </div>
    </div>
  )
}

function findJsonStrings(text: string) {
  const results: string[] = []
  const strings: string[] = []

  try {
    const parsed = JSON.parse(text)
    if (typeof parsed === 'string') {
      strings.push(parsed)
    }

    // Traverse objects or arrays and add all string values to the array
    function traverse(obj: any) {
      if (typeof obj === 'string') {
        strings.push(obj)
      } else if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            traverse(obj[key])
          }
        }
      } else if (Array.isArray(obj)) {
        obj.forEach(traverse)
      }
    }

    traverse(parsed)
  } catch {}

  for (const str of strings) {
    // Use greedy mode to match outermost curly braces or square brackets
    const regex = /[{\[]([^{}\[\]]*|[{\[].*[}\]])*[}\]]/g
    let match

    while ((match = regex.exec(str)) !== null) {
      try {
        const jsonStr = match[0]
        // Analyze bracket pairing and escape characters
        let bracketCount = 0
        let inString = false
        let escaped = false
        let validJson = true

        for (let i = 0; i < jsonStr.length; i++) {
          const char = jsonStr[i]
          
          if (escaped) {
            escaped = false
            continue
          }

          if (char === '\\') {
            escaped = true
            continue
          }

          if (char === '"' && !escaped) {
            inString = !inString
            continue
          }

          if (!inString) {
            if (char === '{' || char === '[') {
              bracketCount++
            } else if (char === '}' || char === ']') {
              bracketCount--
            }

            if (bracketCount < 0) {
              validJson = false
              break
            }
          }
        }

        if (validJson && bracketCount === 0) {
          try {
            // Verify if it's valid JSON
            JSON.parse(jsonStr)
            if (!results.includes(jsonStr)) {
              results.push(jsonStr)
              break
            }
          } catch {}
        }
      } catch {}
    }
  }

  return results
}
