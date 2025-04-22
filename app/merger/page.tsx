import Meta, { generate } from '@/components/Meta'
import TextMerger from './TextMerger'

const { generateMetadata, metaProps } = generate({
  title: 'Data Merger - Text Craft',
  description:
    'Intelligently merge and integrate different data formats. Supports merging text lists, JSON arrays, nested objects, and complex data structures, with smart array detection, structure consistency checks, and flexible merge strategies. Suitable for data integration, configuration merging, and content consolidation. Supports drag-and-drop file loading for convenient data input. Now supports extracting and merging code blocks from MARKDOWN format, automatically recognizing and processing code blocks (such as JSON, TOML, text, etc.) in Markdown for intelligent multi-format content fusion.',
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
