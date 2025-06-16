import { useClickAway } from 'ahooks'
import { useState, useRef } from 'react'

export interface DropdownItem {
  key: string
  label: string
}

export interface DropdownProps {
  items: DropdownItem[]
  onSelect: (key: string) => void
  buttonLabel?: string
}

export default function Dropdown(props: DropdownProps) {
  const { items, onSelect, buttonLabel = 'Select' } = props
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleSelect = (key: string) => {
    onSelect(key)
    setIsOpen(false)
  }

  useClickAway(() => setIsOpen(false), ref)

  return (
    <div className="relative" ref={ref}>
      <button
        className="px-3 py-1 whitespace-nowrap text-xs rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50 flex items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {buttonLabel}
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {items.map((item) => (
              <button
                key={item.key}
                className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-500"
                onClick={() => handleSelect(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
