import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

async function fetchSearchResults (query) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/search?query=${query}`)
  if (!res.ok) {
    throw new Error('Failed to fetch search results')
  }
  const data = await res.json()
  return data.results
}

export default async function ({ params }) {
  const tag = (await params).tag
  const results = await fetchSearchResults(tag)
  return (
    <>
      <div className='mx-auto text-center mt-6 max-w-lg'>
        <h1 className='text-4xl font-bold'>{tag}</h1>
        <h2>{tag} schematic references</h2>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mx-auto px-16 mt-4'>
        {results.hits.map(v => (
          <DesignEntry key={v.id} entry={v} />
        ))}
      </div>
    </>
  )
}

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
