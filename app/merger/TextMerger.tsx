'use client'

import { useState } from 'react'
import * as TOML from '@iarna/toml'
import ReactEditor from '@/components/Editor/ReactEditor'
import { isJson } from '@/utils/json'
import { isToml } from '@/utils/toml'
import { checkArrayContentConsistency, checkObjectStructure, findCompatibleArray, checkArrayTypeConsistency, findLongestArray, setValueByPath } from '@/utils/array'
import { MOCK_JSON_LIST, MOCK_JSON_APPEND_LIST, MOCK_TOML_LIST } from './mock-data'

export default function TextMerger() {
  const [elementScope, setElementScope] = useState('')
  const [newData, setNewData] = useState('')

  const handleMockData = () => {
    setElementScope(JSON.stringify(MOCK_JSON_LIST, null, 2))
    setNewData(JSON.stringify(MOCK_JSON_APPEND_LIST, null, 2))
  }

  const handleTomlMockData = () => {
    setElementScope(MOCK_TOML_LIST)
    setNewData(JSON.stringify(MOCK_JSON_APPEND_LIST, null, 2))
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

  const dataType = isJson(elementScope) ? 'json' : isToml(elementScope) ? 'toml' : 'text'
  const renderData = (data: any) => {
    try {
      if (dataType === 'json') {
        return JSON.stringify(data, null, 2)
      }

      if (dataType === 'toml') {
        return TOML.stringify(data)
      }

      return data.join('\n')
    } catch {
      return data.join('\n')
    }
  }

  const mergeData = () => {
    try {
      const data1 = parseInputData(elementScope)
      const data2 = parseInputData(newData)

      if (!data1 && !data2) {
        return ''
      }

      if (!data1) {
        return data2
      }

      if (!data2) {
        return data1
      }

      // If source data is an object, find and merge the longest array
      if (typeof data1 === 'object' && !Array.isArray(data1)) {
        const longestArray = findLongestArray(data1)
        if (longestArray && Array.isArray(data2)) {
          // Check array content consistency
          if (checkArrayContentConsistency(longestArray.array, data2)) {
            const mergedArray = [...longestArray.array, ...data2]
            const result = setValueByPath(data1, longestArray.path, mergedArray)
            return renderData(result)
          }

          // If content is inconsistent, try to find other compatible arrays
          const compatibleArray = findCompatibleArray(data1, data2)
          if (compatibleArray) {
            const mergedArray = [...compatibleArray.array, ...data2]
            const result = setValueByPath(data1, compatibleArray.path, mergedArray)
            return renderData(result)
          }
        }
      }

      // If source data is an array, merge directly
      if (Array.isArray(data1) && Array.isArray(data2)) {
        const merged = [...data1, ...data2]
        return renderData(merged)
      }

      // Use default merge logic for other cases
      const merged = deepMerge(data1, data2)
      return renderData(merged)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to merge data:', error)
      return ''
    }
  }

  const mergedResult = mergeData()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end mb-2">
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50" onClick={handleMockData}>
            Try JSON
          </button>
          <button className="hidden px-3 py-1 text-xs rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50" onClick={handleTomlMockData}>
            Try TOML
          </button>
        </div>
      </div>
      <div className="flex gap-1 w-full h-[60vh]">
        <div className="flex flex-col w-1/2 gap-1">
          <div className="h-1/2">
            <ReactEditor value={elementScope} onChange={setElementScope} storageKey="merge-lt" />
          </div>

          <div className="h-1/2">
            <ReactEditor value={newData} onChange={setNewData} storageKey="merge-lb" />
          </div>
        </div>

        <div className="w-1/2">
          <ReactEditor value={mergedResult} disabled storageKey="merge-r" />
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
  } else if (isToml(input)) {
    return TOML.parse(input)
  } else {
    return input.split('\n').filter(Boolean)
  }
}
