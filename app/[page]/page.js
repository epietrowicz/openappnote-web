import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import DesignResults from '@/app/ui/design-results'
import Pagination from '@/app/ui/pagination'

export default async function Home ({ params }) {
  const page = (await params).page ?? '1'
  const pageNumber = parseInt(page)

  // const designs = await getDesigns(pageNumber)
  const designs = []
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
