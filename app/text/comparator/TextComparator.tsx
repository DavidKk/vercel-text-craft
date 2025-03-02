'use client'

import { useState } from 'react'
import TextCompareEditor from './TextCompareEditor'

export default function TextComparator() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [similarityThreshold, setSimilarityThreshold] = useState(1)

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Similarity Threshold:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={similarityThreshold}
          onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
          className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-indigo-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
        />
        <span className="text-sm">{(similarityThreshold * 100).toFixed(0)}%</span>
      </div>

      <div className="flex gap-1 w-full">
        <TextCompareEditor targetText={rightText} similarityThreshold={similarityThreshold} storageKey="text-comparator-left" onChange={setLeftText} />
        <TextCompareEditor targetText={leftText} similarityThreshold={similarityThreshold} storageKey="text-comparator-right" onChange={setRightText} />
      </div>
    </div>
  )
}
