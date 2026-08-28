import Search from './ui/search'
import Link from 'next/link'
import { CURATED_TAGS } from '@/lib/tags'

const POPULAR_TAGS = CURATED_TAGS.slice(0, 5)

export default async function Home () {
  return (
    <>
      <div className='flex flex-col'>
        <div className='hero'>
          <div className='hero-content text-center'>
            <div className='max-w-lg'>
              <h1 className='text-5xl font-bold pt-22'>
                Discover electronic hardware designs
              </h1>
              <p className='py-6'>
                Explore open source electronics projects to reference for your next design.
                Search by part number or project tag.
              </p>
              <Search />
            </div>

          </div>
        </div>
        <div className='mt-2 flex flex-wrap items-center justify-center gap-2'>
          <p className='text-gray-500 mr-2'>Popular searches</p>
          {POPULAR_TAGS.map(tag => (
            <SearchBadge key={tag} searchUrl={`/tags/1/${tag}`} title={tag.replace(/-/g, ' ')} />
          ))}
          <Link href='/tags' className='badge badge-outline badge-sm'>
            Browse all tags
          </Link>
        </div>
      </div>
    </>
  )
}

const SearchBadge = ({ searchUrl, title }) => {
  return (
    <Link href={searchUrl} className='badge badge-soft badge-sm'>
      {title}
    </Link>
  )
}
