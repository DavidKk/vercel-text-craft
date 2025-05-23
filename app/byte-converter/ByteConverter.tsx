'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from 'ahooks'
import ReactEditor from '@/components/Editor/ReactEditor'
import FormatTabs from '@/components/FormatTabs'

type ConversionType = 'TO_HALF_WIDTH' | 'TO_FULL_WIDTH'

const CONVERSION_TYPES = ['TO_HALF_WIDTH', 'TO_FULL_WIDTH'] as const satisfies ConversionType[]

/**
 * Convert single-byte characters to double-byte characters
 * Example: Convert half-width characters to full-width characters
 */
function toDoubleByteChar(text: string): string {
  if (!text) return ''

  let result = ''
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    // ASCII character range (33-126) converted to full-width characters (65281-65374)
    if (charCode >= 33 && charCode <= 126) {
      result += String.fromCharCode(charCode + 65248)
    } else if (charCode === 32) {
      // Space converted to full-width space
      result += String.fromCharCode(12288)
    } else {
      result += text.charAt(i)
    }
  }
  return result
}

/**
 * Convert double-byte characters to single-byte characters
 * Example: Convert full-width characters to half-width characters
 */
function toSingleByteChar(text: string): string {
  if (!text) return ''

  let result = ''
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    // Full-width character range (65281-65374) converted to ASCII characters (33-126)
    if (charCode >= 65281 && charCode <= 65374) {
      result += String.fromCharCode(charCode - 65248)
    } else if (charCode === 12288) {
      // Full-width space converted to space
      result += ' '
    } else {
      result += text.charAt(i)
    }
  }
  return result
}

export default function ByteConverter() {
  const [sourceText, setSourceText] = useState('')
  const [convertedText, setConvertedText] = useState('')
  const [conversionType, setConversionType] = useState<ConversionType>(CONVERSION_TYPES[0])
  const debouncedText = useDebounce(sourceText, { wait: 300 })

  useEffect(() => {
    if (debouncedText) {
      const result = conversionType === 'TO_FULL_WIDTH' ? toDoubleByteChar(debouncedText) : toSingleByteChar(debouncedText)
      setConvertedText(result)
    } else {
      setConvertedText('')
    }
  }, [debouncedText, conversionType])

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-end">
        <FormatTabs value={conversionType} onChange={setConversionType} types={CONVERSION_TYPES} />
      </div>

      <div className="flex flex-col md:flex-row gap-1 w-full md:min-h-[500px] md:h-[64vh]">
        <div className="w-full md:w-1/2 min-h-[250px] h-full">
          <ReactEditor title="Source Text" className="min-h-[64vh] md:min-h-[100%]" value={sourceText} onChange={setSourceText} storageKey="byte-converter-source" />
        </div>

        <div className="w-full md:w-1/2 min-h-[250px] h-full">
          <ReactEditor title="Conversion Result" className="min-h-[64vh] md:min-h-[100%]" value={convertedText} />
        </div>
      </div>
    </div>
  )
}
