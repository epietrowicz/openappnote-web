import Search from './ui/search'
import DesignResults from './ui/design-results'
import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import Pagination from './ui/pagination'
import { supabaseService } from '@/lib/db'
import Link from 'next/link'

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

export default async function Home () {
  const pageNumber = 1
  const designs = await getDesigns(pageNumber)
  const nextPageNumber = designs?.length < NUM_RESULTS_PER_PAGE ? pageNumber : pageNumber + 1
  const prevPageNumber = pageNumber === 1 ? 1 : pageNumber - 1

  return (
    <>
      {pageNumber === 1 && (
        <div className='flex flex-col'>
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
          <div className='mt-2 flex items-center justify-center space-x-4'>
            <p className='text-gray-500'>Popular searches</p>
            <SearchBadge searchUrl='/tags/1/arduino/' title='Arduino' />
            <SearchBadge searchUrl='/tags/1/raspberry-pi/' title='Raspberry Pi HAT' />
            <SearchBadge searchUrl='/tags/1/esp32/' title='ESP32' />
            <SearchBadge searchUrl='/tags/1/stm32/' title='STM32' />
            <SearchBadge searchUrl='/tags/1/usb-c/' title='USB-C' />
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

const SearchBadge = ({ searchUrl, title }) => {
  return (
    <Link href={searchUrl} className='badge badge-soft badge-sm'>
      {title}
    </Link>
  )
}
