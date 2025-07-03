import Meta, { generate } from '@/components/Meta'
import ColorConverter from './ColorConverter'

const { generateMetadata, metaProps } = generate({
  title: 'Color Converter - Text Craft',
  description: 'Find and unify all color values in text (such as #fff, rgb, rgba, etc.) to a specified format. Supports conversion between multiple color formats.',
})

export { generateMetadata }

export default function ColorConverterPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col gap-4 p-4 pt-6">
        <Meta {...metaProps} />
        <ColorConverter />
      </div>
    </div>
  )
}
