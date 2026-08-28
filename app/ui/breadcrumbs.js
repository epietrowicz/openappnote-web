import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumbs ({ items }) {
  return (
    <nav aria-label='breadcrumb' className='text-sm breadcrumbs-nav mt-4'>
      <ol className='flex items-center flex-wrap gap-1 text-base-content/70'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.href} className='flex items-center gap-1'>
              {index > 0 && <ChevronRight className='h-3 w-3' />}
              {isLast
                ? <span aria-current='page'>{item.label}</span>
                : <Link href={item.href} className='hover:underline'>{item.label}</Link>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
