import Search from './ui/search'
import Link from 'next/link'

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
        <div className='mt-2 flex items-center justify-center space-x-4'>
          <p className='text-gray-500'>Popular searches</p>
          <SearchBadge searchUrl='/tags/1/arduino/' title='Arduino' />
          <SearchBadge searchUrl='/tags/1/raspberry-pi/' title='Raspberry Pi HAT' />
          <SearchBadge searchUrl='/tags/1/esp32/' title='ESP32' />
          <SearchBadge searchUrl='/tags/1/stm32/' title='STM32' />
          <SearchBadge searchUrl='/tags/1/usb-c/' title='USB-C' />
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
