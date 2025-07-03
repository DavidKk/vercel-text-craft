'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from 'ahooks'
import ReactEditor from '@/components/Editor/ReactEditor'
import FormatTabs from '@/components/FormatTabs'

// Supported color formats
const COLOR_FORMATS = ['HEX', 'RGB', 'RGBA'] as const

type ColorFormat = (typeof COLOR_FORMATS)[number]

// Regex to match HEX, RGB, RGBA colors
const COLOR_REGEX = /#([\da-fA-F]{3,8})\b|rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/g

// HEX to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number; a?: number } | null {
  let c = hex.replace('#', '')
  if (c.length === 3)
    c = c
      .split('')
      .map((x) => x + x)
      .join('')
  if (c.length === 6) c += 'ff'
  if (c.length === 8) {
    const n = parseInt(c, 16)
    return {
      r: (n >> 24) & 255,
      g: (n >> 16) & 255,
      b: (n >> 8) & 255,
      a: Math.round(((n & 255) / 255) * 100) / 100,
    }
  }
  return null
}

// Convert RGB(A) string to object
function rgbStrToObj(str: string[]): { r: number; g: number; b: number; a?: number } | null {
  const [r, g, b, a] = str
  if (r && g && b) {
    return {
      r: Number(r),
      g: Number(g),
      b: Number(b),
      ...(a ? { a: Number(a) } : {}),
    }
  }
  return null
}

// RGB(A) to HEX
function rgbToHex({ r, g, b, a }: { r: number; g: number; b: number; a?: number }): string {
  const hex = (x: number) => x.toString(16).padStart(2, '0')
  let res = `#${hex(r)}${hex(g)}${hex(b)}`
  if (a !== undefined && a < 1) res += hex(Math.round(a * 255))
  return res
}

// RGB(A) to string
function rgbToStr({ r, g, b, a }: { r: number; g: number; b: number; a?: number }, type: 'RGB' | 'RGBA') {
  if (type === 'RGB') return `rgb(${r}, ${g}, ${b})`
  return `rgba(${r}, ${g}, ${b}, ${a !== undefined ? a : 1})`
}

// Unified conversion function
function convertColor(match: string, p1: string, p2: string, p3: string, p4: string, p5: string, target: ColorFormat): string {
  let colorObj: { r: number; g: number; b: number; a?: number } | null = null
  if (match.startsWith('#')) {
    colorObj = hexToRgb(match)
  } else if (match.startsWith('rgb')) {
    colorObj = rgbStrToObj([p2, p3, p4, p5])
  }
  if (!colorObj) return match
  if (target === 'HEX') return rgbToHex(colorObj)
  if (target === 'RGB') return rgbToStr(colorObj, 'RGB')
  if (target === 'RGBA') return rgbToStr(colorObj, 'RGBA')
  return match
}

export default function ColorConverter() {
  const [sourceText, setSourceText] = useState('')
  const [convertedText, setConvertedText] = useState('')
  const [targetFormat, setTargetFormat] = useState<ColorFormat>('HEX')
  const debouncedText = useDebounce(sourceText, { wait: 300 })

  useEffect(() => {
    if (debouncedText) {
      const result = debouncedText.replace(COLOR_REGEX, (...args) => convertColor(args[0], args[1], args[2], args[3], args[4], args[5], targetFormat))
      setConvertedText(result)
    } else {
      setConvertedText('')
    }
  }, [debouncedText, targetFormat])

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-end">
        <FormatTabs value={targetFormat} onChange={setTargetFormat} types={COLOR_FORMATS} />
      </div>
      <div className="flex flex-col md:flex-row gap-1 w-full md:min-h-[500px] md:h-[64vh]">
        <div className="w-full md:w-1/2 min-h-[250px] h-full">
          <ReactEditor title="Source Text" className="min-h-[64vh] md:min-h-[100%]" value={sourceText} onChange={setSourceText} storageKey="color-converter-source" />
        </div>
        <div className="w-full md:w-1/2 min-h-[250px] h-full">
          <ReactEditor title="Conversion Result" className="min-h-[64vh] md:min-h-[100%]" value={convertedText} />
        </div>
      </div>
    </div>
  )
}
