'use client'

import { useState } from 'react'
import TextCompareEditor from './TextCompareEditor'
import Tabs from '@/components/Tabs'
import { MOCK_TEXT_LIST, MOCK_JSON_LIST, MOCK_TOML_LIST } from './mock-data'

export default function TextComparator() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [similarityThreshold, setSimilarityThreshold] = useState(1)
  const [viewMode, setViewMode] = useState<'all' | 'diffs' | 'similar'>('all')

  const handleMockData = () => {
    setLeftText(MOCK_TEXT_LIST)
    setRightText(JSON.stringify(MOCK_JSON_LIST, null, 2))
  }

  const handleTomlMockData = () => {
    setLeftText(MOCK_TEXT_LIST)
    setRightText(MOCK_TOML_LIST)
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium">Similarity Threshold:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
            className="w-26 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-indigo-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
          />
          <span className="text-xs">{(similarityThreshold * 100).toFixed(0)}%</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50" onClick={handleMockData}>
              Try JSON
            </button>
            <button className="hidden px-3 py-1 text-xs rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50" onClick={handleTomlMockData}>
              Try TOML
            </button>
          </div>

          <Tabs
            items={[
              { key: 'all', label: 'All' },
              { key: 'diffs', label: 'Diffs' },
              { key: 'similar', label: 'Similar' },
            ]}
            activeKey={viewMode}
            onChange={(key) => setViewMode(key as 'all' | 'diffs' | 'similar')}
          />
        </div>
      </div>

      <div className="flex gap-1 w-full">
        <div className="w-1/2 h-[60vh]">
          <TextCompareEditor
            value={leftText}
            targetText={rightText}
            similarityThreshold={similarityThreshold}
            storageKey="text-comparator-left"
            onChange={setLeftText}
            viewMode={viewMode}
          />
        </div>

        <div className="w-1/2 h-[60vh]">
          <TextCompareEditor
            value={rightText}
            targetText={leftText}
            similarityThreshold={similarityThreshold}
            storageKey="text-comparator-right"
            onChange={setRightText}
            viewMode={viewMode}
          />
        </div>
      </div>
    </div>
  )
}
