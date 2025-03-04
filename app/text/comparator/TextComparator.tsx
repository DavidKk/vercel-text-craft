'use client'

import { useState } from 'react'
import TextCompareEditor from './TextCompareEditor'
import { mockTextList, mockJsonList } from './mock-data'
import { mockTomlList } from './mock-toml-data'

export default function TextComparator() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [similarityThreshold, setSimilarityThreshold] = useState(1)
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false)

  const handleMockData = () => {
    setLeftText(mockTextList)
    setRightText(JSON.stringify(mockJsonList, null, 2))
  }
  
  const handleTomlMockData = () => {
    setLeftText(mockTextList)
    setRightText(mockTomlList)
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
          <button className="px-3 py-1 text-xs rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50 mr-2" onClick={handleMockData}>
            Try JSON
          </button>
          <button className="px-3 py-1 text-xs rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50" onClick={handleTomlMockData}>
            Try TOML
          </button>

          <div className="flex items-center">
            <button
              className={`px-3 py-1 text-xs rounded-l-sm ${!showOnlyDiffs ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setShowOnlyDiffs(false)}
            >
              All
            </button>
            <button className={`px-3 py-1 text-xs rounded-r-sm ${showOnlyDiffs ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setShowOnlyDiffs(true)}>
              Diffs
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 w-full">
        <div className="w-1/2 min-h-[500px] h-[70vh]">
          <TextCompareEditor
            value={leftText}
            targetText={rightText}
            similarityThreshold={similarityThreshold}
            storageKey="text-comparator-left"
            onChange={setLeftText}
            showOnlyDiffs={showOnlyDiffs}
          />
        </div>
        <div className="w-1/2 min-h-[500px] h-[70vh]">
          <TextCompareEditor
            value={rightText}
            targetText={leftText}
            similarityThreshold={similarityThreshold}
            storageKey="text-comparator-right"
            onChange={setRightText}
            showOnlyDiffs={showOnlyDiffs}
          />
        </div>
      </div>
    </div>
  )
}
