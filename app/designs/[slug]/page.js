import { supabaseService } from '@/lib/db'
import { Download, ExternalLink } from 'lucide-react'
import { sortParts } from '@/lib/util'
import { GhAvatar } from '@/app/ui/gh-avatar'
import Link from 'next/link'
import KicanvasContent from '@/app/ui/kicanvas-content'
import PngView from '@/app/ui/png-view'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

export const revalidate = 86400

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true // or false, to 404 on unknown paths

// Good resource: https://supabase.com/blog/fetching-and-caching-supabase-data-in-next-js-server-components
export async function generateStaticParams () {
  const { data: designData, error: designError } = await supabaseService
    .from('design')
    .select('slug')

  if (designError) {
    console.log(designError)
    return
  }
  return designData
}

export async function generateMetadata ({ params }) {
  const slug = (await params).slug
  const design = await getDesignEntry(slug)
  if (design === null) {
    return null
  }

  return {
    title: design?.repo_description == null
      ? `${design.name} reference design`
      : design.repo_description
  }
}

async function getDesignEntry (slug) {
  if (slug === '%24%24%3A0%3A%24%24' || slug === '$$:0:$$') {
    return null
  }
  const { data: designData, error: designError } = await supabaseService
    .from('design')
    .select('*, design_part(reference_designator, part(*))')
    .eq('slug', slug)
    .single()

  if (designError) {
    console.log('Error getting design entry:', designError)
    throw new Error(designError.message)
  }

  const { data: repoData, error: repoError } = await supabaseService
    .from('repository')
    .select('description, html_url, avatar_url, owner_login, full_name')
    .eq('id', designData.repository_id)
    .single()

  if (repoError) {
    console.log('Error getting repository data:', repoError)
    throw new Error(repoError.message)
  }
  designData.description = repoData.description
  designData.html_url = repoData.html_url
  designData.full_name = repoData.full_name
  designData.repository = {}
  designData.repository.avatar_url = repoData.avatar_url
  designData.repository.owner_login = repoData.owner_login
  return designData
}

// const getReadMe = async (design) => {
//   try {
//     let mainBranch = 'main'
//     let readMeUrl = `https://raw.githubusercontent.com/${design.full_name}/refs/heads/${mainBranch}/README.md`
//     let readMe = await fetch(readMeUrl)
//     if (!readMe.ok) {
//       mainBranch = 'master'
//       readMeUrl = `https://raw.githubusercontent.com/${design.full_name}/refs/heads/${mainBranch}/README.md`
//       readMe = await fetch(readMeUrl)
//     }
//     const readMeText = await readMe.text()

//     // Build base to rewrite relative markdown links into absolute GitHub URLs.
//     const githubBaseUrl = `https://github.com/${design.owner}/${design.name}/blob/main/`

//     return { readMeText, githubBaseUrl }
//   } catch (error) {
//     console.log('Error getting readme:', error)
//     return null
//   }
// }

export default async function ({ params }) {
  const slug = (await params).slug
  const design = await getDesignEntry(slug)
  if (design === null) {
    return
  }
  const encodedPath = design.full_path.split('/').map(s => encodeURIComponent(s)).join('/')
  const designUrl = `${process.env.DO_BUCKET_PATH}/repositories/${encodedPath}`
  const pdfUrl = `${designUrl}/schematic.pdf`
  const brdUrl = `${designUrl}/board.kicad_pcb`
  const topPng = `${designUrl}/top.png`
  const bottomPng = `${designUrl}/bottom.png`
  const bomUrl = `${designUrl}/bom.csv`
  // const readMeData = await getReadMe(design)
  // const readMe = readMeData?.readMeText
  // const githubBaseUrl = readMeData?.githubBaseUrl

  const sortedDesign = sortParts(design.design_part)
  const parts = sortedDesign.map(({ part }) => part)// .slice(0, NUM_PARTS_TO_TAG)
  const designName = design.name.replaceAll('-', ' ').replaceAll('_', ' ')

  return (
    <div className='w-full max-w-5xl mx-auto px-4'>
      <div className='flex items-start justify-between mt-6'>
        <div>
          <div className='flex items-center space-x-2'>
            <Link href={`/profile/${design.repository.owner_login}`}>
              <GhAvatar design={design} height={37} width={37} />
            </Link>
            <div>
              <h1 className='text-3xl font-bold capitalize'>{designName}</h1>
              <Link href={`/profile/${design.repository.owner_login}`}>
                <p className='text-sm'>{design.owner}</p>
              </Link>
            </div>
          </div>
          <p className='mt-2'>{design.description}</p>
        </div>
        <a
          href={design.html_url}
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-primary'
        >
          View on GitHub
          <img height='25' width='25' src='https://cdn.simpleicons.org/github/ffffff' />
        </a>
      </div>

      <div className='flex items-center justify-between mt-6 mb-2'>
        <h2 className='text-lg font-bold capitalize mt-4 mb-2'>Main components</h2>
        <a
          href={bomUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-link'
        >
          Download full BOM
          <Download className='h-5 w-5' />
        </a>
      </div>
      <div className='max-h-56 overflow-y-auto'>
        <table className='table-xs md:table-sm table-pin-rows table w-full'>
          <thead>
            <tr>
              <th className='bg-base-300'>Part Number</th>
              <th className='bg-base-300'>Description</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <tr key={part.id}>
                <td className='badge badge-soft badge-sm my-2'>
                  <Link href={`/tags/1/${part.part_number}`}>
                    {part.part_number}
                  </Link>
                </td>
                <td>{part.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='flex items-center justify-between mt-6 mb-2'>
        <h2 className='text-lg font-bold capitalize'>{designName} schematic</h2>
        <a
          href={pdfUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-link'
        >
          Open in new tab
          <ExternalLink className='h-5 w-5' />
        </a>
      </div>
      <div className='h-[80vh] rounded-xs'>
        <iframe
          src={`${pdfUrl}#navpanes=0`}
          className='w-full h-full'
          title='PDF Viewer'
        />
      </div>

      <h2 className='text-lg font-bold capitalize mt-6 mb-2'>{designName} board layout</h2>
      <KicanvasContent
        fileUrls={[brdUrl]}
      />

      {/* <h2 className='text-lg font-bold capitalize mt-6 mb-2'>{designName} PCB render</h2>
      <PngView topPngUrl={topPng} bottomPngUrl={bottomPng} />

      {readMe && (
        <>
          <h2 className='text-lg font-bold capitalize mt-6 mb-2'>{designName} README</h2>
          <div className='prose max-w-none mt-2 rounded-md border border-base-300 p-6'>
            <ReactMarkdown
              components={{
                // Drop relative images from README entirely.
                // Many READMEs use `![...](../../releases/.../foo.png)` which won't resolve here.
                img: ({ src, ...props }) => {
                  if (typeof src === 'string' && !src.startsWith('http://') && !src.startsWith('https://')) {
                    return null
                  }
                  return <img src={src} {...props} />
                }
              }}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              urlTransform={(url, key) => {
                if (!url) return url

                // Leave fragment-only links and common absolute protocols alone.
                if (
                  url.startsWith('#') ||
                  url.startsWith('http://') ||
                  url.startsWith('https://') ||
                  url.startsWith('mailto:') ||
                  url.startsWith('tel:') ||
                  url.startsWith('data:')
                ) return url

                // Avoid rewriting absolute-path URLs. Those are likely relative to this page's route.
                if (url.startsWith('/')) return url

                // Only rewrite markdown *link* URLs. Images are handled separately via `components.img`.
                if (key !== 'href') return url

                if (githubBaseUrl) {
                  return new URL(url, githubBaseUrl).toString()
                }

                return url
              }}
            >
              {readMe}
            </ReactMarkdown>
          </div>
        </>
      )} */}
    </div>
  )
}
