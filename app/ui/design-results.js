import { Star } from 'lucide-react'
import Link from 'next/link'
import { GhAvatar } from './gh-avatar'
import KicanvasPreview from './kicanvas-preview'
import { notFound } from 'next/navigation'

async function getParts (designId) {
  return []
}

async function fetchRepository (owner, repo) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fetch-repository?owner=${owner}&repo=${repo}`)
  if (!res.ok) {
    return notFound() // Show 404 if API fails
  }
  const data = await res.json()
  return data
}

async function DesignEntry ({ entry }) {
  const parts = await getParts(entry.id)
  const { result: repository } = await fetchRepository(entry.repository.owner.login, entry.repository.name)
  const designName = entry.repository.name.replaceAll('-', ' ').replaceAll('_', ' ')
  const fullName = entry.repository.full_name
  const path = entry.path
  const ref = new URL(entry.url).searchParams.get('ref')
  const rawUrl = `https://raw.githubusercontent.com/${fullName}/${ref}/${path}`

  return (
    <Link
      href={`/designs/${entry.repository.owner.login}/${entry.repository.name}/${encodeURIComponent(path)}`}
      className='card bg-base-100 w-full shadow-sm'
    >
      <figure className='bg-base-300 h-[250px] flex items-center justify-center'>
        <KicanvasPreview src={rawUrl} />
      </figure>
      <div className='card-body'>
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
          <div className='flex items-center space-x-2'>
            <GhAvatar avatarUrl={repository.owner.avatar_url} />
            <p className='text-sm'>{entry.repository.owner.login}</p>
          </div>
          <div className='flex items-center space-x-1'>
            <Star className='h-4 w-4 ' />
            <p className='text-sm'>{repository.stargazers_count ?? 0}</p>
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
        <DesignEntry key={v.sha} entry={v} />
      ))}
    </div>
  )
}
