export default function Loading () {
  return (
    <div className='w-full max-w-5xl mx-auto px-4'>
      <div className='flex items-start justify-between mt-6'>
        <div className='flex-1'>
          <div className='flex items-center space-x-2'>
            <div className='skeleton w-[37px] h-[37px] rounded-full' />
            <div>
              <div className='skeleton h-9 w-48 mb-2' />
              <div className='skeleton h-4 w-32' />
            </div>
          </div>
          <div className='skeleton h-5 w-96 mt-2' />
        </div>
        <div className='skeleton h-10 w-32' />
      </div>

      <div className='mt-4 mb-2'>
        <div className='skeleton h-6 w-40' />
      </div>
      <div className='max-h-56 overflow-y-auto'>
        <div className='skeleton h-48 w-full' />
      </div>

      <div className='flex items-center justify-between mt-6 mb-2'>
        <div className='skeleton h-6 w-48' />
        <div className='skeleton h-10 w-36' />
      </div>
      <div className='skeleton h-96 w-full' />
    </div>
  )
}
