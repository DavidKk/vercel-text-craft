import Meta from '@/components/Meta'
import Comparator from './TextComparator'

export default function TextComparator() {
  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex flex-col items-center">
      <div className="w-full flex flex-col gap-4 py-10 px-4">
        <Meta title={<span>Text Comparator</span>} description="Compare texts with line-by-line analysis and similarity matching to identify differences and common elements." />
        <Comparator />
      </div>
    </div>
  )
}
