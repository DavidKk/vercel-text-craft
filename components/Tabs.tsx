'use client'

import type { ReactNode } from 'react'

export interface TabItem {
  key: string
  label: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  activeKey: string
  onChange: (key: string) => void
  className?: string
}

export default function Tabs({ items, activeKey, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {items.map((item, index) => {
        const isActive = item.key === activeKey
        const isFirst = index === 0
        const isLast = index === items.length - 1

        const style = isActive ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900'

        return (
          <button
            key={item.key}
            className={`px-3 py-1 text-xs ${style} ${isFirst ? 'rounded-l-sm' : ''} ${isLast ? 'rounded-r-sm' : ''}`}
            onClick={() => onChange(item.key)}
            disabled={item.disabled}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
