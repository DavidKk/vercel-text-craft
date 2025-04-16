'use client'

import type { ReactNode } from 'react'

export interface TabItem {
  key: string
  label: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  className?: string
  items: TabItem[]
  activeKey: string
  onChange: (key: string) => void
  size?: 'xs' | 'sm'
}

export default function Tabs(props: TabsProps) {
  const { className = '', items, activeKey, onChange, size = 'sm' } = props

  return (
    <div className={`flex items-center ${className}`}>
      {items.map((item, index) => {
        const isActive = item.key === activeKey
        const isFirst = index === 0
        const isLast = index === items.length - 1
        const style = isActive ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        const roundedLStyle = size === 'xs' ? 'rounded-l-sm' : 'rounded-l-md'
        const roundedRStyle = size === 'xs' ? 'rounded-r-sm' : 'rounded-r-md'
        const py = size === 'xs' ? 'py-0' : 'py-1'
        const px = size === 'xs' ? 'px-1' : 'px-3'

        return (
          <button
            key={item.key}
            className={`font-bold text-xs ${px} ${py} ${style} ${isFirst ? roundedLStyle : ''} ${isLast ? roundedRStyle : ''}`}
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
