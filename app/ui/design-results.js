import { supabaseService } from '@/lib/db'
import { sortParts } from '@/lib/util'
import { Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { GhAvatar } from './gh-avatar'

async function getParts (designId) {
  const { data: partsData, error: partsError } = await supabaseService
    .from('design_part')
    .select('reference_designator, part(*)')
    .eq('design_id', designId)

  if (partsError) {
    console.log(partsError)
  }
  const parts = sortParts(partsData)
  return parts.map(({ part }) => part).slice(0, 3)
}

async function DesignEntry ({ entry }) {
  const parts = await getParts(entry.id)
  const designName = entry.name.replaceAll('-', ' ').replaceAll('_', ' ')

  return (
    <Link
      href={`/designs/${entry.slug}`}
      className='card bg-base-100 w-full shadow-sm'
    >
      <figure className='bg-base-300 h-[250px] flex items-center justify-center'>
        <Image
          unoptimized
          alt={`Thumbnail for ${designName} design`}
          src={`https://openappnote-designs.sfo3.digitaloceanspaces.com/repositories/${encodeURIComponent(entry.full_path)}/top.png`}
          width={300}
          height={300}
        />
      </figure>
      <div className='card-body'>
        <h2 className='card-title capitalize'>
          {designName}
        </h2>
        <p>
          {entry.repo_description}
        </p>

        <div className='flex items-start justify-start space-x-2 flex-wrap'>
          {parts.map(part => (
            <div key={part.id} className='badge badge-soft badge-primary badge-sm flex-none mt-2'>
              <h4 className='flex-none'>
                {part.part_number}
              </h4>
            </div>
          ))}
        </div>

        <div className='flex items-center justify-start space-x-4 mt-2'>
          <div className='flex items-center space-x-2'>
            <GhAvatar design={entry} />
            <p className='text-sm'>{entry.owner}</p>
          </div>
          <div className='flex items-center space-x-1'>
            <Star className='h-4 w-4 ' />
            <p className='text-sm'>{entry?.repository?.stars ?? 0}</p>
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
