import DesignResults from '@/app/ui/design-results'
import { octokit } from '@/lib/gh'
import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export const revalidate = 86400
export const dynamicParams = true

async function getGithubUser (owner) {
  try {
    const { data } = await octokit.users.getByUsername({ username: owner })
    return data
  } catch {
    return null
  }
}

async function getOwnerDesigns (owner, pageNum) {
  try {
    const response = await octokit.search.code({
      q: `user:${owner} extension:kicad_sch`,
      per_page: NUM_RESULTS_PER_PAGE,
      page: pageNum
    })

    return {
      designs: response.data.items,
      totalCount: response.data.total_count
    }
  } catch (error) {
    console.error('Error fetching GitHub designs:', error)
    return { designs: [], totalCount: 0 }
  }
}

export async function generateMetadata ({ params }) {
  const owner = (await params).owner
  const user = await getGithubUser(owner)

  return {
    title: user?.name ? `${user.name} (@${owner})` : owner,
    description: user?.bio ?? `KiCad reference designs by ${owner} on GitHub`
  }
}

export default async function ProfilePage ({ params }) {
  const owner = (await params).owner
  const pageNumber = 1

  const user = await getGithubUser(owner)
  if (!user) notFound()

  const { designs, totalCount } = await getOwnerDesigns(owner, pageNumber)

  return (
    <div>
      <div className='mx-auto flex flex-col items-center justify-center mt-6 max-w-lg'>
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
