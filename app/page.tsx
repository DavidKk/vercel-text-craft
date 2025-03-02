import Meta, { generate } from '@/components/Meta'

const { generateMetadata, metaProps } = generate({
  title: 'Text Craft - Powerful Text Processing Toolkit',
  description:
    "Text Craft is a powerful text processing toolkit that provides text comparison and similarity matching features. Supporting line-by-line analysis, real-time comparison, and difference highlighting, it's perfect for code review and document version comparison scenarios.",
})

export { generateMetadata }

export default function Home() {
  return (
    <div className="flex flex-col items-center p-10 pt-20">
      <Meta {...metaProps} />
    </div>
  )
}
