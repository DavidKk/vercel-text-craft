'use client'

export interface FormatTabsProps<T extends string> {
  value: T
  onChange: (format: T) => void
  types: readonly T[]
}

export default function FormatTabs<T extends string>(props: FormatTabsProps<T>) {
  const { value, onChange, types } = props

  return (
    <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-md">
      {types.map((format) => {
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
