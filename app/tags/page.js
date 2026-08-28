import Link from 'next/link'
import { CURATED_TAGS } from '@/lib/tags'

export const metadata = {
  title: 'Browse tags',
  description: 'Browse open source KiCad reference designs by component, manufacturer, and protocol tags.',
  alternates: { canonical: '/tags' },
  openGraph: {
    title: 'Browse tags | Open App Note',
    description: 'Browse open source KiCad reference designs by component, manufacturer, and protocol tags.'
  },
  twitter: {
    title: 'Browse tags | Open App Note',
    description: 'Browse open source KiCad reference designs by component, manufacturer, and protocol tags.'
  }
}

export default function TagsPage () {
  return (
    <div className='mx-auto max-w-3xl px-4 mt-8'>
      <h1 className='text-3xl font-bold'>Browse tags</h1>
      <p className='mt-2 text-base-content/70'>
        Explore open source KiCad reference designs by component, manufacturer, and protocol.
      </p>
      <div className='flex flex-wrap gap-2 mt-6'>
        {CURATED_TAGS.map(tag => (
          <Link key={tag} href={`/tags/1/${tag}`} className='badge badge-soft badge-lg'>
            {tag.replace(/-/g, ' ')}
          </Link>
        ))}
      </div>
    </div>
  )
}
