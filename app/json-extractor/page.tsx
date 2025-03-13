'use client'

import Meta from '@/components/Meta'
import JsonFinder from './JsonFinder'

const metaProps = {
  title: 'JSON Extractor',
  description: 'Extract and format JSON strings from text content',
  keywords: ['JSON', 'extractor', 'parser', 'formatter'],
}

export default function JsonExtractorPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col gap-4 p-4 pt-6">
        <Meta {...metaProps} />
        <JsonFinder />
      </div>
    </div>
  )
}
