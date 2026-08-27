import { ExternalLink } from 'lucide-react'
import { getKicadProjectName } from '@/lib/util'
import { getPublicApiUrl } from '@/lib/public-api-url'
import { GhAvatar } from '@/app/ui/gh-avatar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Papa from 'papaparse'
import { octokit } from '@/lib/gh'
import KicanvasRemoteContent from '@/app/ui/kicanvas-remote-content'
import BomView from '@/app/ui/bom-view'

export const revalidate = 86400
export const dynamicParams = true

export async function generateMetadata ({ params }) {
  const { owner, repo } = await params

  try {
    const { data: repository } = await octokit.rest.repos.get({ owner, repo })
    return {
      title: repository.description
        ? repository.description
        : `${repository.name} reference design`,
      description: repository.description ??
        `KiCad reference design from ${owner}/${repo} on GitHub`
    }
  } catch {
    return { title: `${repo} reference design` }
  }
}

async function fetchBom (rootSchUrl, remainingSchUrls) {
  const res = await fetch(`${getPublicApiUrl()}/github/bom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rootUrl: rootSchUrl, urls: remainingSchUrls })
  })
  if (!res.ok) {
    return notFound()
  }

  const csv = await res.text()
  const { data: parts } = Papa.parse(csv, { header: true, skipEmptyLines: true })
  return parts
}

async function fetchDesign (owner, repo) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fetch-repository?owner=${owner}&repo=${repo}`)
  if (!res.ok) {
    return notFound()
  }

  return await res.json()
}

async function fetchTree (repository, path) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fetch-tree?owner=${repository.owner.login}&repo=${repository.name}&path=${path}&ref=${repository.default_branch}`)
  if (!res.ok) {
    return notFound()
  }

  return await res.json()
}

export default async function ({ params }) {
  const { owner, repo } = await params
  const path = decodeURIComponent((await params)['sch-path'])

  if (path === '$$:0:$$') return <></>

  const pathPartsString = path.includes('/')
    ? path.split('/').slice(0, -1).join('/')
    : ''

  const { result: repository } = await fetchDesign(owner, repo)
  const { result: projectFiles } = await fetchTree(repository, pathPartsString)
  const projectName = getKicadProjectName(projectFiles)

  const rawProjectUrls = projectFiles.map(file =>
    `https://raw.githubusercontent.com/${repository.full_name}/${repository.default_branch}/${file.path}`
  )

  const rootUrl = `${repository.html_url}/tree/${repository.default_branch}/${pathPartsString}`
  const schematicFiles = rawProjectUrls.filter(url => url.endsWith('.kicad_sch'))
  const rootSchUrl = projectName
    ? schematicFiles.find(url => url.endsWith(`${projectName}.kicad_sch`))
    : null
  const parts = rootSchUrl
    ? await fetchBom(rootSchUrl, schematicFiles)
    : []
  const pcbFiles = rawProjectUrls.filter(url => url.endsWith('.kicad_pcb'))

  return (
    <div className='w-full max-w-5xl mx-auto px-4'>
      <div className='flex items-start justify-between mt-6'>
        <div>
          <div className='flex items-center space-x-2'>
            <Link href={`/profile/${repository.owner.login}`}>
              <GhAvatar avatarUrl={repository.owner.avatar_url} height={37} width={37} />
            </Link>
            <div>
              <h1 className='text-3xl font-bold capitalize'>{repository.name}</h1>
              <Link href={`/profile/${repository.owner.login}`}>
                <p className='text-sm'>{repository.owner.login}</p>
              </Link>
            </div>
          </div>
          <p className='mt-2'>{repository.description}</p>
        </div>
        <a
          href={rootUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-primary'
        >
          View on GitHub
          <img height='25' width='25' src='https://cdn.simpleicons.org/github/ffffff' alt='' />
        </a>
      </div>

      <h2 className='text-lg font-bold capitalize mt-4 mb-2'>Components ({parts.length})</h2>
      <div className='max-h-56 overflow-y-auto'>
        <BomView data={parts} />
      </div>

      <div className='flex items-center justify-between mt-6 mb-4'>
        <h2 className='text-lg font-bold capitalize'>{repository.name} schematic</h2>
        <a
          href={`https://kicanvas.org/?github=${rootUrl}`}
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-outline'
        >
          Full page viewer
          <ExternalLink className='h-5 w-5' />
        </a>
      </div>
      <KicanvasRemoteContent fileUrls={schematicFiles} />

      <div className='flex items-center justify-between mt-6 mb-2'>
        <h2 className='text-lg font-bold capitalize'>{repository.name} board</h2>
      </div>
      <KicanvasRemoteContent fileUrls={pcbFiles} />
    </div>
  )
}
