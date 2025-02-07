import DesignResults from '@/app/ui/design-results'
import Pagination from '@/app/ui/pagination'
import { supabaseService } from '@/lib/db'
import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import Image from 'next/image'

export async function getDesigns (pageNum, owner) {
  const startingOffset = (pageNum - 1) * NUM_RESULTS_PER_PAGE
  const endingOffset = startingOffset + NUM_RESULTS_PER_PAGE - 1

  const { data, error } = await supabaseService
    .from('design')
    .select('*, repository!inner(id, stars, avatar_url, did_process)')
    .eq('repository.did_process', true)
    .eq('repository.owner_login', owner)
    .order('repository(stars)', { ascending: false })
    .range(startingOffset, endingOffset)

  if (error) {
    console.log(error)
    return []
  }
  return data
}

export default async function ({ params, searchParams }) {
  const owner = (await params).owner

  const query = await searchParams
  const pageNumber = query?.page == null
    ? 1
    : parseInt(query.page)

  const designs = await getDesigns(pageNumber, owner)
  const nextPageNumber = designs?.length < NUM_RESULTS_PER_PAGE ? pageNumber : pageNumber + 1
  const prevPageNumber = pageNumber === 1 ? 1 : pageNumber - 1

  if (designs.length === 0) {
    return (
      <div className='mx-auto text-center mt-6 max-w-lg'>
        <h1 className='text-4xl font-bold'>{owner}</h1>
        <h2>No designs</h2>
      </div>
    )
  }

  return (
    <div>
      <div className='mx-auto flex flex-col items-center justify-center mt-6 max-w-lg'>
        <Image
      unoptimized
          className='rounded-full'
          alt={`Avatar for ${designs[0].owner}`}
          src={designs[0].repository.avatar_url}
          width={80}
          height={80}
        />
        <a
          href={`https://github.com/${owner}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h1 className='text-4xl font-bold mt-2'>{owner}</h1>
        </a>
        <h2>{designs.length} {designs.length === 1 ? 'design' : 'designs'}</h2>
      </div>
      <div className='flex-1'>
        <DesignResults designs={designs} />
      </div>
      <Pagination
        pageNumber={pageNumber}
        nextPageNumber={nextPageNumber}
        prevPageNumber={prevPageNumber}
      />
    </div>
  )
}
