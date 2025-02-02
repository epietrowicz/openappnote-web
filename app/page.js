import Search from './ui/search'
import DesignResults from './ui/design-results'
import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import Pagination from './ui/pagination'
import { supabaseService } from '@/lib/db'

export async function getDesigns (pageNum) {
  const startingOffset = (pageNum - 1) * NUM_RESULTS_PER_PAGE
  const endingOffset = startingOffset + NUM_RESULTS_PER_PAGE - 1

  const { data, error } = await supabaseService
    .from('design')
    .select('*, repository!inner(id, stars, avatar_url, did_process)')
    .eq('repository.did_process', true)
    .order('repository(stars)', { ascending: false })
    .range(startingOffset, endingOffset)

  if (error) {
    console.log(error)
    return []
  }
  return data
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
                Explore open source electronics projects to reference for your next design.
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
      <Pagination
        pageNumber={pageNumber}
        nextPageNumber={nextPageNumber}
        prevPageNumber={prevPageNumber}
      />
    </>
  )
}
