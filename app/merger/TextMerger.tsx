'use client'

import { useCallback, useMemo, useState } from 'react'
import * as TOML from '@iarna/toml'
import ReactEditor from '@/components/Editor/ReactEditor'
import Tabs from '@/components/Tabs'
import { isJson } from '@/utils/json'
import { isToml } from '@/utils/toml'
import { isYaml } from '@/utils/yaml'
import { checkArrayContentConsistency, checkObjectStructure, findCompatibleArray, checkArrayTypeConsistency, findLongestArray, setValueByPath } from '@/utils/array'
import { extractCodeBlocksFromMarkdown } from '@/utils/markdown'
import { parseText } from '@/utils/parser'
import { MOCK_JSON_LIST, MOCK_JSON_APPEND_LIST, MOCK_TOML_LIST, MOCK_MARKDOWN_LIST } from './mock-data'

type DataType = 'json' | 'toml' | 'yaml' | 'text'

export default function TextMerger() {
  const [sourceContent, setSourceContent] = useState('')
  const [newContent, setNewContent] = useState('')
  const [activeTabKey, setActiveTabKey] = useState(0)

  const handleMockData = () => {
    setSourceContent(JSON.stringify(MOCK_JSON_LIST, null, 2))
    setNewContent(JSON.stringify(MOCK_JSON_APPEND_LIST, null, 2))
  }

  const handleTomlMockData = () => {
    setSourceContent(MOCK_TOML_LIST)
    setNewContent(JSON.stringify(MOCK_JSON_APPEND_LIST, null, 2))
  }

  const handleMarkdownMockData = () => {
    setSourceContent(MOCK_MARKDOWN_LIST)
    setNewContent(JSON.stringify(MOCK_JSON_APPEND_LIST, null, 2))
  }

  const deepMerge = (value1: any, value2: any) => {
    if (value1 === null || value1 === undefined) {
      return value2
    }

    if (value2 === null || value2 === undefined) {
      return value1
    }

    if (Array.isArray(value1) && Array.isArray(value2)) {
      // Check array element type consistency
      const mergedArray = [...value1, ...value2]
      return checkArrayTypeConsistency(mergedArray) ? mergedArray : value1
    }

    if (typeof value1 === 'object' && typeof value2 === 'object') {
      // Check object structure consistency
      if (!checkObjectStructure(value1, value2)) {
        return value1
      }

      const result = { ...value1 }
      for (const key in value2) {
        if (key in result) {
          result[key] = deepMerge(result[key], value2[key])
        } else {
          result[key] = value2[key]
        }
      }

      return result
    }

    if (typeof value1 === 'string' && typeof value2 === 'string') {
      return `${value1}\n${value2}`
    }

    return value1
  }

  const renderData = (data: any, dataType: DataType): string => {
    try {
      if (dataType === 'json') {
        return JSON.stringify(data, null, 2)
      }

      if (dataType === 'toml') {
        return TOML.stringify(data)
      }

      return data.join('\n')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to render data:', error)
      return data.join('\n')
    }
  }

  const mergeData = useCallback(
    (data: string, dataType: DataType): string => {
      try {
        const source = data.toString()
        dataType = isJson(source) ? 'json' : isToml(source) ? 'toml' : 'text'

        const data1 = parseInputData(source)
        const data2 = parseInputData(newContent.toString())
        console.log({ data1, data2 })

        if (!data1 && !data2) {
          return ''
        }

        if (!data1) {
          return ''
        }

        if (!data2) {
          return ''
        }

        // If source data is an object, find and merge the longest array
        if (typeof data1 === 'object' && !Array.isArray(data1)) {
          const longestArray = findLongestArray(data1)
          if (longestArray && Array.isArray(data2)) {
            // Check array content consistency
            if (checkArrayContentConsistency(longestArray.array, data2)) {
              const mergedArray = [...longestArray.array, ...data2]
              const result = setValueByPath(data1, longestArray.path, mergedArray)
              return renderData(result, dataType)
            }

            // If content is inconsistent, try to find other compatible arrays
            const compatibleArray = findCompatibleArray(data1, data2)
            if (compatibleArray) {
              const mergedArray = [...compatibleArray.array, ...data2]
              const result = setValueByPath(data1, compatibleArray.path, mergedArray)
              return renderData(result, dataType)
            }
          }
        }

        // If source data is an array, merge directly
        if (Array.isArray(data1)) {
          if (Array.isArray(data2)) {
            const merged = [...data1, ...data2]
            return renderData(merged, dataType)
          }

          const merged = [...data1, data2]
          return renderData(merged, dataType)
        }

        // Use default merge logic for other cases
        const merged = deepMerge(data1, data2)
        return renderData(merged, dataType)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to merge data:', error)
        return ''
      }
    },
    [newContent]
  )

  const mergedResults = useMemo(() => {
    const content = sourceContent?.trim()
    const codeBlocks = extractCodeBlocksFromMarkdown(content)
    if (codeBlocks?.length) {
      return codeBlocks.map((item) => {
        const dataType = item.type === 'json' ? 'json' : item.type === 'toml' ? 'toml' : item.type === 'yaml' ? 'yaml' : 'text'
        const data = mergeData(item.content, dataType)
        return { data, dataType }
      })
    }

    const dataType = isJson(content) ? 'json' : isToml(content) ? 'toml' : isYaml(content) ? 'yaml' : 'text'
    const data = mergeData(content, dataType)
    return [{ data, dataType }]
  }, [sourceContent, mergeData])

  const finalActiveTabKey = useMemo(() => {
    if (mergedResults?.length === 1) {
      return 0
    }

    if (mergedResults?.length > 1 && activeTabKey > mergedResults?.length - 1) {
      return mergedResults?.length - 1
    }

    return activeTabKey
  }, [mergedResults, activeTabKey])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end mb-2">
        <div className="flex gap-2">
          <button className="px-3 py-1 whitespace-nowrap text-xs rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50" onClick={handleMockData}>
            Try JSON
          </button>
          <button className="px-3 py-1 whitespace-nowrap text-xs rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50" onClick={handleTomlMockData}>
            Try TOML
          </button>
          <button className="px-3 py-1 whitespace-nowrap text-xs rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50" onClick={handleMarkdownMockData}>
            Try Markdown
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-1 w-full md:min-h-[500px] md:h-[60vh]">
        <div className="flex flex-col gap-1 w-full md:w-1/2 min-h-[250px] h-full">
          <div className="md:h-1/2">
            <ReactEditor
              className="min-h-[40vh] md:min-h-[auto]"
              title={<div className="flex items-center h-6 px-1">Origin datas</div>}
              value={sourceContent}
              onChange={setSourceContent}
              storageKey="merge-lt"
            />
          </div>
          <div className="md:h-1/2">
            <ReactEditor
              className="min-h-[40vh] md:min-h-[auto]"
              title={<div className="flex items-center h-6 px-1">Need merge datas</div>}
              value={newContent}
              onChange={setNewContent}
              storageKey="merge-lb"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 min-h-[250px] h-full flex flex-col gap-1">
          {!mergedResults?.length ? (
            <ReactEditor title={<div className="flex items-center h-6 px-1">Merged result</div>} className="min-h-[40vh] md:min-h-[auto]" disabled />
          ) : (
            <>
              <div className="flex items-center justify-between bg-indigo-100 p-1 rounded-md">
                <h1 className="text-xs font-bold select-none pl-2">Total {mergedResults.length}</h1>
                <div className="flex">
                  <Tabs
                    activeKey={finalActiveTabKey.toString()}
                    onChange={(key) => setActiveTabKey(parseInt(key))}
                    items={mergedResults.map(({ dataType }, index) => ({
                      key: index.toString(),
                      label: `${dataType} ${index + 1}`.toUpperCase(),
                    }))}
                  />
                </div>
              </div>

              <div className="overflow-y-auto h-full">
                <ReactEditor className="min-h-[40vh] md:min-h-[auto]" value={mergedResults[finalActiveTabKey]?.data} disabled />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const parseInputData = (input: string) => {
  if (!input) {
    return undefined
  }

  if (isJson(input)) {
    return JSON.parse(input)
  }

  if (isToml(input)) {
    return TOML.parse(input)
  }

  const lines = input.split('\n')
  return Array.from(
    (function* () {
      for (const line of lines) {
        if (line.trim() === '') {
          continue
        }

        try {
          yield JSON.parse(line)
        } catch (e) {
          yield line
        }
      }
    })()
  )
}
