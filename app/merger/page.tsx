import Meta, { generate } from '@/components/Meta'
import TextMerger from './TextMerger'

const { generateMetadata, metaProps } = generate({
  title: 'Data Merger - Text Craft',
  description:
    'Merge and combine different data formats intelligently. Supports merging text lists, JSON arrays, nested objects, and complex data structures. Features smart array detection, structure consistency checking, and flexible merging strategies. Ideal for data integration, configuration merging, and content consolidation.',
})

export { generateMetadata }

export default function MergerPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col gap-4 p-4 pt-6">
        <Meta {...metaProps} />
        <TextMerger />
      </div>
    </div>
  )
}
