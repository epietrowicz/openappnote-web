import { Star, UserCircle } from 'lucide-react'
import Link from 'next/link'

async function DesignEntry ({ entry }) {
  return (
    <Link
      href={`/designs/${entry.slug}`}
    >
      <div className='h-56 w-full overflow-hidden bg-base-300 relative rounded-sm z-0'>
        <img
          className='h-52 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
          alt={`Thumbnail for ${entry.name} design`}
          src={`https://openappnote-bucket.nyc3.digitaloceanspaces.com/repositories/${entry.full_path}/cover.png`}
        />
        <div className='absolute z-1 top-0 left-0 w-1/2 bg-base-300 h-full'>
          <h3 className='text-lg font-bold text-left px-4 py-2'>{entry.name}</h3>
        </div>

        {/* <div
          className={`absolute z-1 w-full h-full
                        bg-base-200 opacity-0 hover:opacity-100
                        bg-opacity-70 duration-300`}
        >
          <div className='flex w-full h-full items-end justify-start px-4 py-2'>
            <span className='font-bold text-sm'>{entry.name}</span>
          </div>
        </div> */}
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2 pt-2'>
          <UserCircle className='h-5 w-5' />
          <p className='text-sm'>{entry.owner}</p>
        </div>
        <div className='flex items-center space-x-1 pt-2'>
          <Star className='h-4 w-4 fill-neutral stroke-neutral' />
          <p className='text-sm'>{entry.stars}</p>
        </div>
      </div>
    </Link>
  )
}

export default function DesignResults ({ designs }) {
  if (designs.length === 0) {
    return (
      <div className='text-left mt-8'>
        <h2>No designs found</h2>
      </div>
    )
  }
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mx-auto px-16 mt-4'>
      {designs.map(v => (
        <DesignEntry key={v.id} entry={v} />
      ))}
    </div>
  )
}
