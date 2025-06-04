'use client'

import React, { useMemo, useId, useCallback } from 'react'
import toml from '@iarna/toml'
import FeatherIcon from 'feather-icons-react'
import { isJson } from '@/utils/json'
import { isToml } from '@/utils/toml'
import { isProperties } from '@/utils/properties'
import Codemirror, { type CodemirrorProps } from './Codemirror'
import type { TextSegment } from './types'
import { isYaml } from '@/utils/yaml'

export type { TextSegment } from './types'

export interface ReactEditorProps extends CodemirrorProps {
  className?: string
  title?: React.ReactNode
  /** show prettier button */
  enablePrettier?: boolean
  /** auto prettier when value changed */
  autoPrettier?: boolean
  /** Array of text segments to be displayed in the editor */
  segments?: TextSegment[]
}

type FormatType = 'TEXT' | 'JSON' | 'TOML' | 'PROPERTIES' | 'YAML'

const formatText = (value: string, dataType: FormatType) => {
  if (!value) {
    return value
  }

  switch (dataType) {
    case 'JSON':
      const data = JSON.parse(value)
      return JSON.stringify(data, null, 2)
    case 'TOML':
      const tomlData = toml.parse(value)
      return toml.stringify(tomlData)
    case 'PROPERTIES':
      const propertiesData = value.split('\n').map((line) => {
        const [key, value] = line.split('=')
        return `${key.trim()}=${value.trim()}`
      })
      return propertiesData.join('\n')
    default:
      return value
  }
}

function getDataType(value?: string) {
  if (!value) {
    return 'TEXT'
  }

  if (isJson(value)) {
    return 'JSON'
  }

  if (isToml(value)) {
    return 'TOML'
  }

  if (isProperties(value)) {
    return 'PROPERTIES'
  }

  if (isYaml(value)) {
    return 'YAML'
  }

  return 'TEXT'
}

export default function ReactEditor(props: ReactEditorProps) {
  const { className = '', title, value, onChange, onBlur, enablePrettier = true, autoPrettier = false, segments, storageKey, disabled, hiddenLines, format } = props

  const rawUid = useId()
  const uid = useMemo(() => `${rawUid.replace(/[^a-zA-Z0-9]/g, '')}`, [rawUid])
  const dataType = useMemo(() => getDataType(value), [value])
  const canPrettier = useMemo(() => ['JSON', 'TOML'].includes(dataType), [enablePrettier, dataType]) // Properties formatting not added yet

  const handleChange = useCallback(
    (value: string) => {
      if (typeof onChange !== 'function') {
        return
      }

      const dataType = getDataType(value)
      const formattedText = autoPrettier && value ? formatText(value, dataType) : value
      onChange(formattedText)
    },
    [onChange]
  )

  const handleFormatText = useCallback(() => {
    if (typeof onChange !== 'function') {
      return
    }

    if (!(typeof value === 'string' && value.length > 0)) {
      return
    }

    const formattedText = formatText(value, dataType)
    formattedText && onChange(formattedText)
  }, [value, dataType, onChange])

  const copyVisibleContent = () => {
    navigator.clipboard.writeText(value || '')
  }

  const highlightLines = useMemo(() => {
    if (!(Array.isArray(segments) && segments.length)) {
      return
    }

    const lines: Record<string, number[]> = {}
    for (const { className, startLine, endLine, ignoredLines = [] } of segments) {
      for (let line = startLine; line <= endLine; line++) {
        if (ignoredLines.includes(line)) {
          continue
        }

        lines[className] = lines[className] || []
        lines[className].push(line)
      }
    }

    return lines
  }, [segments])

  return (
    <div className={`${className} h-full flex flex-col gap-1`}>
      {title ? <h2 className="text-xs bg-indigo-100 py-1 px-2 rounded-md font-bold">{title}</h2> : null}

      <div className={`flex editor-container group ${uid} flex-1 w-full h-full relative overflow-y-auto`}>
        <div className="absolute z-10 right-5 top-2">
          <button
            className="p-1 bg-indigo-100 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:bg-indigo-200 rounded-sm transition-all"
            onClick={copyVisibleContent}
            title="copy full text"
          >
            <FeatherIcon icon="copy" className="h-4 w-4 text-indigo-900" />
          </button>
        </div>

        <div className="flex gap-2 absolute z-10 right-5 bottom-5 text-xs font-extrabold text-indigo-600 uppercase">
          {!(enablePrettier && canPrettier) ? null : (
            <span
              className="cursor-pointer select-none p-1 bg-indigo-100 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-indigo-200 rounded-sm transition-all"
              onClick={handleFormatText}
            >
              Pritter
            </span>
          )}
          <span className="select-none p-1 bg-indigo-100 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-indigo-200 rounded-sm transition-all">{dataType}</span>
        </div>

        <Codemirror
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          storageKey={storageKey}
          disabled={disabled}
          highlightLines={highlightLines}
          hiddenLines={hiddenLines}
          format={format}
        />
      </div>
    </div>
  )
}
