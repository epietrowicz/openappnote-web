import Search from './ui/search'

export default function Home () {
  return (
    <>
      <div className='hero'>
        <div className='hero-content text-center'>
          <div className='max-w-lg'>
            <h1 className='text-5xl font-bold pt-12'>
              Discover electronic hardware designs
            </h1>
            <p className='py-6'>
              Explore open source electronic projects by component part number or project tag.
            </p>
            <Search />
          </div>
        </div>
      </div>
    </>
  )
}
