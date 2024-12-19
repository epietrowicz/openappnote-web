import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

function DesignEntry ({ entry }) {
  return (
    <Link
      href={`/designs/${entry.slug}`}
    >
      <div className='h-56 w-full overflow-hidden bg-base-300 relative rounded-sm z-0'>
        <Image
          fill
          alt={`Schematic thumbnail for ${entry.name} design`}
          src={`https://openappnote-bucket.nyc3.digitaloceanspaces.com/repositories/${entry.full_path}/${entry.name}.png`}
        />

        <div
          className={`absolute z-1 w-full h-full 
                        bg-base-200 opacity-0 hover:opacity-100 
                        bg-opacity-70 duration-300`}
        >
          <div className='flex w-full h-full items-end justify-start p-4'>
            <span className='font-bold text-sm'>{entry.name}</span>
          </div>
        </div>
      </div>
      <div className='flex items-center space-x-2 pt-2'>
        <User className='h-5 w-5' />
        <p>{entry.owner}</p>
      </div>
    </Link>
  )
}

export default function DesignResults ({ designs }) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mx-auto px-16 mt-4'>
      {designs.map(v => (
        <DesignEntry key={v.id} entry={v} />
      ))}
    </div>
  )
}
