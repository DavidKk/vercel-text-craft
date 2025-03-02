'use client'

export type FormatType = 'json' | 'toml' | 'yaml' | 'csv' | 'text'

export interface FormatTabsProps {
  value: FormatType
  onChange: (format: FormatType) => void
}

const FORMAT_TYPES = ['json', 'toml', 'yaml', 'csv', 'text'] as const satisfies FormatType[]

export default function FormatTabs(props: FormatTabsProps) {
  const { value, onChange } = props

  return (
    <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-md">
      {FORMAT_TYPES.map((format) => {
        const style = value === format ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        return (
          <button className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${style}`} key={format} onClick={() => onChange(format)}>
            {format.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
