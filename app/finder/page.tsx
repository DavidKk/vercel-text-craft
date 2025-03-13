'use client'

import Meta from '@/components/Meta'
import JsonFinder from './JsonFinder'

const metaProps = {
  title: 'JSON Finder',
  description: 'Find and parse JSON strings in text',
  keywords: ['JSON', 'finder', 'parser', 'formatter']
}

export default function FinderPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col gap-4 p-4 pt-6">
        <Meta {...metaProps} />
        <JsonFinder />
      </div>
    </div>
  )
}