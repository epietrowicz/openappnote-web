import DesignResults from '@/app/ui/design-results'
import { searchKicadSchematics } from '@/lib/github-search'
import Pagination from '@/app/ui/pagination'
import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import { notFound } from 'next/navigation'

export const revalidate = 86400

export async function generateMetadata ({ params }) {
  const tag = (await params).tag
  const searchTitle = tag.replace(/-/g, ' ')

  return {
    title: `Reference electronics designs for ${searchTitle}`
  }
}

async function fetchSearchResults (query, page) {
  try {
    return await searchKicadSchematics(query, page)
  } catch (error) {
    console.error('Error fetching search results:', error)
    return notFound()
  }
}

export default async function ({ params }) {
  const tag = (await params).tag
  const page = (await params).page ?? '1'
  const pageNumber = parseInt(page)
  const searchTitle = tag.replace(/-/g, ' ')

  const { results, totalHits } = await fetchSearchResults(tag, pageNumber)
  const nextPageNumber = results?.length < NUM_RESULTS_PER_PAGE ? pageNumber : pageNumber + 1
  const prevPageNumber = pageNumber === 1 ? 1 : pageNumber - 1

  const subTitle = totalHits > 1
    ? `${totalHits} results for "${searchTitle}"`
    : `${totalHits} result for "${searchTitle}"`

  return (
    <>
      <div className='mx-auto text-center mt-6 max-w-lg'>
        <h1 className='text-4xl font-bold'>{searchTitle}</h1>
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
