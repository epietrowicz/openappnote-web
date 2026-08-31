import DesignResults from '@/app/ui/design-results'
import { searchDesigns } from '@/lib/design-search'
import { getGithubUser } from '@/lib/github-user'
import Breadcrumbs from '@/app/ui/breadcrumbs'
import JsonLd from '@/app/ui/json-ld'
import { HOME_CRUMB, breadcrumbListSchema } from '@/lib/breadcrumb-schema'
import { SITE_URL } from '@/lib/site-url'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export const revalidate = 86400
export const dynamicParams = true

async function fetchGithubUser (owner) {
  try {
    return await getGithubUser(owner)
  } catch {
    return null
  }
}

async function getOwnerDesigns (owner, pageNum) {
  try {
    const { results, totalHits } = await searchDesigns(`user:${owner}`, pageNum)
    return { designs: results, totalCount: totalHits }
  } catch (error) {
    console.error('Error fetching GitHub designs:', error)
    return { designs: [], totalCount: 0 }
  }
}

export async function generateMetadata ({ params }) {
  const owner = (await params).owner
  const user = await fetchGithubUser(owner)

  const title = user?.name ? `${user.name} (@${owner})` : owner
  const description = user?.bio ?? `KiCad reference designs by ${owner} on GitHub`

  return {
    title,
    description,
    alternates: { canonical: `/profile/${owner}` },
    openGraph: { title, description },
    twitter: { title, description }
  }
}

export default async function ProfilePage ({ params }) {
  const owner = (await params).owner
  const pageNumber = 1

  const user = await fetchGithubUser(owner)
  if (!user) notFound()

  const { designs, totalCount } = await getOwnerDesigns(owner, pageNumber)
  const breadcrumbItems = [HOME_CRUMB, { label: `@${owner}`, href: `/profile/${owner}` }]

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name ?? owner,
    alternateName: owner,
    url: `https://github.com/${owner}`,
    image: user.avatar_url,
    mainEntityOfPage: `${SITE_URL}/profile/${owner}`
  }

  return (
    <div>
      <JsonLd data={breadcrumbListSchema(breadcrumbItems)} />
      <JsonLd data={personSchema} />
      <div className='mx-auto flex flex-col items-center justify-center mt-6 max-w-lg'>
        <Breadcrumbs items={breadcrumbItems} />
        <Image
          unoptimized
          className='rounded-full'
          alt={`Avatar for ${owner}`}
          src={user.avatar_url}
          width={80}
          height={80}
        />
        <a
          href={`https://github.com/${owner}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h1 className='text-4xl font-bold mt-2'>{owner}</h1>
        </a>
        {user.name && <p className='text-base-content/70'>{user.name}</p>}
        {user.bio && <p className='text-sm text-center mt-1'>{user.bio}</p>}
        <h2 className='mt-2'>
          {totalCount} {totalCount === 1 ? 'design' : 'designs'}
        </h2>
      </div>

      {designs.length === 0
        ? (
          <div className='mx-auto text-center mt-8 max-w-lg'>
            <p>No public designs found for this GitHub user.</p>
          </div>
          )
        : (
          <div className='flex-1'>
            <DesignResults designs={designs} />
          </div>
          )}
    </div>
  )
}
