import { Star } from 'lucide-react'
import Link from 'next/link'
import DesignEntryLink from '@/app/ui/design-entry-link'
import PartTags from '@/app/ui/part-tags'
import { NUM_PARTS_TO_TAG } from '@/lib/util'
import { GhAvatar } from './gh-avatar'

function DesignEntry ({ entry }) {
  const repository = entry.repository
  const owner = repository.owner.login
  const designName = entry.projectName.replaceAll('-', ' ').replaceAll('_', ' ')
  const parts = entry.parts.slice(0, NUM_PARTS_TO_TAG)

  return (
    <div className='card bg-base-100 w-full shadow-sm hover:shadow-md transition-shadow duration-200 relative'>
      <DesignEntryLink
        href={`/designs/${owner}/${repository.name}/${encodeURIComponent(entry.rootSchPath)}`}
        className='rounded-2xl'
        ariaLabel={designName}
      />
      <div className='card-body relative z-10 pointer-events-none'>
        <h2 className='card-title capitalize'>
          {designName}
        </h2>
        <p>
          {repository.description}
        </p>

        <div className='flex items-start justify-start space-x-2 flex-wrap pointer-events-auto'>
          <PartTags parts={parts} />
        </div>

        <div className='flex items-center justify-start space-x-4 mt-2'>
          <Link
            href={`/profile/${owner}`}
            className='flex items-center space-x-2 pointer-events-auto hover:underline'
          >
            <GhAvatar avatarUrl={repository.owner.avatar_url} alt={`Avatar for ${owner}`} />
            <p className='text-sm'>{owner}</p>
          </Link>
          <div className='flex items-center space-x-1'>
            <Star className='h-4 w-4 ' />
            <p className='text-sm'>{repository.stargazers_count ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function NoDesignsFound () {
  return (
    <div className='text-left mt-8'>
      <h2>No designs found</h2>
    </div>
  )
}

export default function DesignResults ({ designs }) {
  if (designs.length === 0) {
    return <NoDesignsFound />
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto px-16 mt-4'>
      {designs.map(entry => (
        <DesignEntry key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
