export default function Loading () {
  return (
    <>
      <div className='mx-auto text-center mt-6 max-w-lg'>
        <div className='skeleton h-10 w-64 mx-auto mb-4' />
        <div className='skeleton h-6 w-48 mx-auto' />
      </div>
      <div className='flex-1'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto px-16 mt-4'>
          {[...Array(6)].map((_, index) => (
            <div key={index} className='card bg-base-100 w-full shadow-sm'>
              <figure className='bg-base-300 h-[250px] flex items-center justify-center'>
                <div className='skeleton h-full w-full' />
              </figure>
              <div className='card-body'>
                <div className='skeleton h-6 w-3/4 mb-2' />
                <div className='skeleton h-4 w-full mb-1' />
                <div className='skeleton h-4 w-5/6 mb-4' />
                <div className='flex items-start justify-start space-x-2 flex-wrap'>
                  <div className='skeleton h-6 w-16 rounded-full' />
                  <div className='skeleton h-6 w-20 rounded-full' />
                </div>
                <div className='flex items-center justify-start space-x-4 mt-2'>
                  <div className='flex items-center space-x-2'>
                    <div className='skeleton w-6 h-6 rounded-full' />
                    <div className='skeleton h-4 w-20' />
                  </div>
                  <div className='skeleton h-4 w-12' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='flex items-center justify-center mt-12'>
        <div className='skeleton h-10 w-20' />
        <div className='skeleton h-6 w-8 mx-4' />
        <div className='skeleton h-10 w-20' />
      </div>
    </>
  )
}
