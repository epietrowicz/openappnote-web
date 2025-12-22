import { supabaseService } from '@/lib/db'
import { Download, ExternalLink } from 'lucide-react'
import BoardView from '@/app/ui/board-view'
import { sortParts } from '@/lib/util'
import { GhAvatar } from '@/app/ui/gh-avatar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Papa from 'papaparse'
import KicanvasPreview from '@/app/ui/kicanvas-preview'
import StepViewer from '@/app/ui/step-viewer'
import { octokit } from '@/lib/gh'
import KicanvasContainer from '@/app/ui/kicanvas-container'
import KicanvasContent from '@/app/ui/kicanvas-content'

export const revalidate = 86400

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true // or false, to 404 on unknown paths

// Good resource: https://supabase.com/blog/fetching-and-caching-supabase-data-in-next-js-server-components
// export async function generateStaticParams () {
//   // const { data: designData, error: designError } = await supabaseService
//   //   .from('design')
//   //   .select('slug')

//   // if (designError) {
//   //   console.log(designError)
//   //   return
//   // }
//   // return designData
// }

export async function generateMetadata ({ params }) {
  // const slug = (await params).slug
  // const design = await getDesignEntry(slug)

  // return {
  //   title: design?.repo_description == null
  //     ? `${design.name} reference design`
  //     : design.repo_description
  // }
}

async function fetchBom (schUrls) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ urls: schUrls })
  })
  if (!res.ok) {
    return notFound() // Show 404 if API fails
  }
  return { result: await res.json() }
}

async function fetch3d (repository, path) {
  const ghRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fetch-pcb?owner=${repository.owner.login}&repo=${repository.name}&path=${path}&tree_sha=${repository.default_branch}`)
  if (!ghRes.ok) {
    return notFound() // Show 404 if API fails
  }
  const pcbData = await ghRes.json()
  const pcbRes = await fetch(pcbData.result)
  if (!pcbRes.ok) {
    throw new Error(`Failed to fetch from GitHub: ${pcbRes.statusText}`)
  }

  const kicadPcbContent = await pcbRes.text()
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/board-3d-glb`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: kicadPcbContent
  })
  if (!res.ok) {
    return notFound() // Show 404 if API fails
  }
  // Fetch GLB as arrayBuffer and convert to data URI
  const glbArrayBuffer = await res.arrayBuffer()
  const base64 = Buffer.from(glbArrayBuffer).toString('base64')
  return `data:model/gltf-binary;base64,${base64}`
}

async function fetchDesign (owner, repo) {
  // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/search?query=${query}&page=${page}`, {
  //   next: { revalidate: 86400 }
  // })
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fetch-repository?owner=${owner}&repo=${repo}`)
  if (!res.ok) {
    return notFound() // Show 404 if API fails
  }

  const data = await res.json()
  return data
}

async function fetchTree (repository, path) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fetch-tree?owner=${repository.owner.login}&repo=${repository.name}&path=${path}&ref=${repository.default_branch}`)
  if (!res.ok) {
    return notFound() // Show 404 if API fails
  }
  const data = await res.json()
  return data
}

export default async function ({ params }) {
  const { owner, repo } = await params
  const path = decodeURIComponent((await params)['sch-path'])

  // I have no idea why this is happening, but it's related to kicanvas
  if (path === '$$:0:$$') return <></>

  const pathParts = path.split('/').filter(value => !value.includes('.kicad_sch') && !value.includes('.kicad_pcb'))
  const pathPartsString = pathParts.join('/')

  const { result: repository } = await fetchDesign(owner, repo)
  const { result: projectFiles } = await fetchTree(repository, pathPartsString)

  const rawProjectUrls = projectFiles.map(file =>
    `https://raw.githubusercontent.com/${repository.full_name}/${repository.default_branch}/${encodeURIComponent(file.path)}`
  )
  const { result: parts } = await fetchBom(rawProjectUrls.filter(url => url.endsWith('.kicad_sch')))

  const rootUrl = `${repository.html_url}/tree/${repository.default_branch}/${pathPartsString}`

  return (
    <div className='w-full max-w-5xl mx-auto px-4'>
      <div className='flex items-start justify-between mt-6'>
        <div>
          <div className='flex items-center space-x-2'>
            <Link href={`/designs/${repository.owner.login}`}>
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
          <img height='25' width='25' src='https://cdn.simpleicons.org/github/ffffff' />
        </a>
      </div>

      <h2 className='text-lg font-bold capitalize mt-4 mb-2'>Components ({parts.length})</h2>
      <div className='max-h-56 overflow-y-auto'>
        <table className='table-xs md:table-sm table-pin-rows table w-full'>
          <thead>
            <tr>
              <th className='bg-base-300'>Reference</th>
              <th className='bg-base-300'>Value</th>
              <th className='bg-base-300'>Description</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part, index) => (
              <tr key={part.Reference + part.Value + index}>
                <td>{part.Reference}</td>
                <td>{part.Value}</td>
                <td>{part.Description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='flex items-center justify-between mt-6 mb-2'>
        <h2 className='text-lg font-bold capitalize'>{repository.name} schematic</h2>
        <a
          href={`https://kicanvas.org/?github=${rootUrl}`}
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-primary'
        >
          Full page viewer
          <ExternalLink className='h-5 w-5' />
        </a>
      </div>
      <KicanvasContent
        fileUrls={rawProjectUrls.filter(url => !url.endsWith('.kicad_pro'))}
      />
    </div>
  )
}
