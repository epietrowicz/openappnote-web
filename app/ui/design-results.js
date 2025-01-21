import { Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

async function DesignEntry ({ entry }) {
  return (
    <Link
      href={`/designs/${entry.slug}`}
      className='card bg-base-100 w-full shadow-sm'
    >
      <figure className='bg-base-300'>
        <Image
          className='p-2'
          alt={`Thumbnail for ${entry.name} design`}
          src={`https://openappnote-bucket.nyc3.digitaloceanspaces.com/repositories/${entry.full_path}/cover.png`}
          width={300}
          height={300}
        />
      </figure>
      <div className='card-body'>
        <h2 className='card-title'>
          {entry.name}
        </h2>
        <p>
          {entry.repo_description}
        </p>

        {/* <div className='card-actions'>
          <div className='badge badge-primary badge-sm'>Fashion</div>
          <div className='badge badge-primary badge-sm'>Products</div>
        </div> */}

        <div className='flex items-center justify-start space-x-4 mt-2'>
          <div className='flex items-center space-x-2'>
            <Image
              className='rounded-full'
              alt={`Avatar for ${entry.owner}`}
              src={entry.avatar_url}
              width={22}
              height={22}
            />
            <p className='text-sm'>{entry.owner}</p>
          </div>
          <div className='flex items-center space-x-1'>
            <Star className='h-4 w-4 ' />
            <p className='text-sm'>{entry.stars}</p>
          </div>
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
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto px-16 mt-4'>
      {designs.map(v => (
        <DesignEntry key={v.id} entry={v} />
      ))}
    </div>
  )
}
