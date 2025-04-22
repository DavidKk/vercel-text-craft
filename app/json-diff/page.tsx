'use client'

import Meta from '@/components/Meta'
import JsonDiff from './JsonDiff'

const metaProps = {
  title: 'JSON Diff',
  description: '',
  keywords: ['JSON', 'diff', 'formatter'],
}

export default function JsonDiffPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col gap-4 p-4 pt-6">
        <Meta {...metaProps} />
        <JsonDiff />
      </div>
    </div>
  )
}
