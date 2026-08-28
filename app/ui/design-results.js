import { Star } from 'lucide-react'
import Link from 'next/link'
import { getRepository } from '@/lib/github-repository'
import DesignEntryLink from '@/app/ui/design-entry-link'
import { GhAvatar } from './gh-avatar'

async function getParts (designId) {
  return []
}

async function DesignEntry ({ entry, repository }) {
  const parts = await getParts(entry.id)
  const designName = entry.repository.name.replaceAll('-', ' ').replaceAll('_', ' ')
  const path = entry.path
  const owner = entry.repository.owner.login
  // Get the root .kicad_pro file name
  // use that to identify the root .kicad_sch file
  // use the root .kicad_sch file to generate the BOM
  // then filter by the .kicad_sch extension at the same level as the root .kicad_pro file
  // to provide to kicanvas
  return (
    <div className='card bg-base-100 w-full shadow-sm hover:shadow-md transition-shadow duration-200 relative'>
      <DesignEntryLink
        href={`/designs/${owner}/${entry.repository.name}/${encodeURIComponent(path)}`}
        className='rounded-2xl'
        ariaLabel={designName}
      />
      <div className='card-body relative z-10 pointer-events-none'>
        <h2 className='card-title capitalize'>
          {designName}
        </h2>
        <p>
          {entry.repository.description}
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

function repositoryKey (owner, repo) {
  return `${owner}/${repo}`
}

async function fetchRepositoriesByKey (designs) {
  const uniqueRepos = [...new Map(
    designs.map(({ repository }) => [repositoryKey(repository.owner.login, repository.name), repository])
  ).values()]

  const entries = await Promise.all(
    uniqueRepos.map(async ({ owner, name }) => {
      try {
        const repository = await getRepository(owner.login, name)
        return [repositoryKey(owner.login, name), repository]
      } catch (error) {
        console.error(`Error fetching repository ${owner.login}/${name}:`, error.status ?? error)
        return [repositoryKey(owner.login, name), null]
      }
    })
  )

  return new Map(entries)
}

function NoDesignsFound () {
  return (
    <div className='text-left mt-8'>
      <h2>No designs found</h2>
    </div>
  )
}

export default async function DesignResults ({ designs }) {
  if (designs.length === 0) {
    return <NoDesignsFound />
  }

  const repositoriesByKey = await fetchRepositoriesByKey(designs)

  const entriesWithRepository = designs
    .map(entry => ({
      entry,
      repository: repositoriesByKey.get(repositoryKey(entry.repository.owner.login, entry.repository.name))
    }))
    .filter(({ repository }) => repository != null)

  if (entriesWithRepository.length === 0) {
    return <NoDesignsFound />
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto px-16 mt-4'>
      {entriesWithRepository.map(({ entry, repository }) => (
        <DesignEntry key={entry.sha} entry={entry} repository={repository} />
      ))}
    </div>
  )
}
