import Meta, { generate } from '@/components/Meta'
import ByteConverter from './ByteConverter'

const { generateMetadata, metaProps } = generate({
  title: 'Byte Converter - Text Craft',
  description: 'Convert between double-byte characters (such as Chinese) and single-byte characters. Supports drag-and-drop file loading for easy data input.',
})

export { generateMetadata }

export default function ByteConverterPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col gap-4 p-4 pt-6">
        <Meta {...metaProps} />
        <ByteConverter />
      </div>
    </div>
  )
}
