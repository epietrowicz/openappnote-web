import DesignResults from '@/app/ui/design-results'
import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

async function fetchSearchResults (query, page) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/search?query=${query}&page=${page}`)
  if (!res.ok) {
    throw new Error('Failed to fetch search results')
  }
  const data = await res.json()
  return data.results
}

export default async function ({ params, searchParams }) {
  const tag = (await params).tag

  const query = await searchParams
  const pageNumber = query?.page == null
    ? 1
    : parseInt(query.page)

  const results = await fetchSearchResults(tag, pageNumber)
  const nextPageNumber = results?.length < NUM_RESULTS_PER_PAGE ? pageNumber : pageNumber + 1
  const prevPageNumber = pageNumber === 1 ? 1 : pageNumber - 1

  return (
    <>
      <div className='mx-auto text-center mt-6 max-w-lg'>
        <h1 className='text-4xl font-bold'>{tag}</h1>
        <h2>{tag} electronic design references</h2>
      </div>
      <div className='flex-1'>
        <DesignResults designs={results} />
      </div>
      <div className='flex items-center justify-center mt-12'>
        <Link className='btn btn-link' href={`/?page=${prevPageNumber}`}>
          <ArrowLeft className='h-5 w-5' />
          Back
        </Link>
        <span>
          {pageNumber}
        </span>
        <Link className='btn btn-link' href={`/?page=${nextPageNumber}`}>
          Next
          <ArrowRight className='h-5 w-5' />
        </Link>
      </div>
    </>
  )
}
