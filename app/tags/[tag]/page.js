import DesignResults from '@/app/ui/design-results'
import Pagination from '@/app/ui/pagination'
import { NUM_RESULTS_PER_PAGE } from '@/lib/util'

export async function generateMetadata ({ params }) {
  const tag = (await params).tag
  return {
    title: `Reference electronics designs for ${tag}`
  }
}

async function fetchSearchResults (query, page) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/search?query=${query}&page=${page}`)
  if (!res.ok) {
    throw new Error('Failed to fetch search results')
  }
  const data = await res.json()
  return data
}

export default async function ({ params, searchParams }) {
  const tag = (await params).tag

  const query = await searchParams
  const pageNumber = query?.page == null
    ? 1
    : parseInt(query.page)

  const { results, totalHits } = await fetchSearchResults(tag, pageNumber)
  const nextPageNumber = results?.length < NUM_RESULTS_PER_PAGE ? pageNumber : pageNumber + 1
  const prevPageNumber = pageNumber === 1 ? 1 : pageNumber - 1

  const subTitle = totalHits > 1
    ? `${totalHits} results for "${decodeURIComponent(tag)}"`
    : `${totalHits} result for "${decodeURIComponent(tag)}"`

  return (
    <>
      <div className='mx-auto text-center mt-6 max-w-lg'>
        <h1 className='text-4xl font-bold'>{decodeURIComponent(tag)}</h1>
        <h2>{subTitle}</h2>
      </div>
      <div className='flex-1'>
        <DesignResults designs={results} />
      </div>
      <Pagination
        pageNumber={pageNumber}
        nextPageNumber={nextPageNumber}
        prevPageNumber={prevPageNumber}
        searchQuery={tag}
      />
    </>
  )
}
