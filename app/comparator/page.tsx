import Meta, { generate } from '@/components/Meta'
import Comparator from './TextComparator'

const { generateMetadata, metaProps } = generate({
  title: 'Text Comparator - Text Craft',
  description:
    'Compare texts with line-by-line analysis and similarity matching. Supports comparing text lists, JSON array strings, TOML arrays, and JSON objects to identify differences and common elements. Perfect for code review, data validation, configuration comparison, and TOML configuration analysis. Supports drag-and-drop file loading for easy data input.',
})

export { generateMetadata }

export default function TextComparator() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col gap-4 p-4 pt-6">
        <Meta {...metaProps} />
        <Comparator />
      </div>
    </div>
  )
}
