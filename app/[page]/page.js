import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import { supabaseService } from '@/lib/db'
import DesignResults from '@/app/ui/design-results'
import Pagination from '@/app/ui/pagination'

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

export default async function Home ({ params }) {
  const page = (await params).page ?? '1'
  const pageNumber = parseInt(page)

  const designs = await getDesigns(pageNumber)
  const nextPageNumber = designs?.length < NUM_RESULTS_PER_PAGE ? pageNumber : pageNumber + 1
  const prevPageNumber = pageNumber === 1 ? 1 : pageNumber - 1

  return (
    <>
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
