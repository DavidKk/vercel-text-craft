import Meta, { generate } from '@/components/Meta'
import Comparator from './TextComparator'

const { generateMetadata, metaProps } = generate({
  title: 'Text Comparator - Text Craft',
  description:
    'Compare texts with line-by-line analysis and similarity matching. Supports comparing text lists, JSON array strings, and JSON objects to identify differences and common elements. Perfect for code review, data validation, and configuration comparison.',
})

export { generateMetadata }

export default function TextComparator() {
  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex flex-col items-center">
      <div className="w-full flex flex-col gap-4 py-10 px-4">
        <Meta {...metaProps} />
        <Comparator />
      </div>
    </div>
  )
}
