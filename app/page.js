import { supabaseService } from '@/lib/db'
import Search from './ui/search'
import DesignResults from './ui/design-results'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import { getRepositoryInfo } from '@/lib/gh'

async function getDesigns (pageNum) {
  const startingOffset = (pageNum - 1) * NUM_RESULTS_PER_PAGE
  const endingOffset = startingOffset + (NUM_RESULTS_PER_PAGE - 1)

  const { data, error } = await supabaseService
    .from('repository')
    .select('id, design(*)')
    .eq('did_process', true)
    .range(startingOffset, endingOffset)

  if (error) {
    console.log(error)
  }
  let designs = data.filter(repo => repo.design.length > 0)
  designs = designs.flatMap(repo => repo.design)

  const promises = designs.map(design => getRepositoryInfo(design))
  const results = await Promise.all(promises)
  return results
}

export default async function Home ({ searchParams }) {
  const query = await searchParams
  const pageNumber = query?.page == null
    ? 1
    : parseInt(query.page)

  const designs = await getDesigns(pageNumber)
  const nextPageNumber = designs?.length < NUM_RESULTS_PER_PAGE ? pageNumber : pageNumber + 1
  const prevPageNumber = pageNumber === 1 ? 1 : pageNumber - 1

  return (
    <>
      {pageNumber === 1 && (
        <div className='hero'>
          <div className='hero-content text-center'>
            <div className='max-w-lg'>
              <h1 className='text-5xl font-bold pt-12'>
                Discover electronic hardware designs
              </h1>
              <p className='py-6'>
                Explore open source electronic projects to reference for your next design.
                Search by part number or project tag.
              </p>
              <Search />
            </div>
          </div>
        </div>
      )}
      <div className='mt-12 flex-1'>
        <DesignResults designs={designs} />
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
