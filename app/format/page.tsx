import Meta, { generate } from '@/components/Meta'
import TextFormat from './TextFormat'

const { generateMetadata, metaProps } = generate({
  title: 'Text Format - Text Craft',
  description: 'Convert text content between different data formats, supporting conversions among JSON, TOML, YAML, and other formats. Supports drag-and-drop file loading for easy data input.',
})

export { generateMetadata }

export default function FormatPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col gap-4 p-4 pt-6">
        <Meta {...metaProps} />
        <TextFormat />
      </div>
    </div>
  )
}
