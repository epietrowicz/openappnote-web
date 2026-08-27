export default function DesignLoading () {
  return (
    <div className='w-full max-w-5xl mx-auto px-4'>
      <div className='flex items-start justify-between mt-6'>
        <div className='flex items-center space-x-2'>
          <div className='skeleton w-[37px] h-[37px] rounded-full shrink-0' />
          <div className='space-y-2'>
            <div className='skeleton h-8 w-48' />
            <div className='skeleton h-4 w-24' />
          </div>
        </div>
        <div className='skeleton h-10 w-36 shrink-0' />
      </div>
      <div className='skeleton h-4 w-full max-w-md mt-2' />

      <div className='skeleton h-6 w-40 mt-4 mb-2' />
      <div className='skeleton h-56 w-full' />

      <div className='skeleton h-6 w-48 mt-6 mb-4' />
      <div className='skeleton h-96 w-full' />

      <div className='skeleton h-6 w-40 mt-6 mb-2' />
      <div className='skeleton h-96 w-full mb-8' />

      <div className='flex items-center justify-center gap-3 pb-12'>
        <span className='loading loading-spinner loading-md' />
        <p className='text-base-content/70'>Loading design…</p>
      </div>
    </div>
  )
}
