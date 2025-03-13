export type FormatType = 'json' | 'toml' | 'yaml' | 'csv' | 'text'

export const FORMAT_TYPES = ['json', 'toml', 'yaml', 'csv', 'text'] as const satisfies FormatType[]
