import { supabaseService } from '@/lib/db'
import { Download, ExternalLink } from 'lucide-react'
import BoardView from '@/app/ui/board-view'
import { NUM_PARTS_TO_TAG, sortParts } from '@/lib/util'
import PartTags from '@/app/ui/part-tags'

// Next.js will invalidate the cache when a
// request comes in, at most once every 60 seconds.
export const revalidate = 60

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true // or false, to 404 on unknown paths

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

  return {
    title: design.repo_description ?? `${design.name} reference design`
  }
}

async function getDesignEntry (slug) {
  const { data: designData, error: designError } = await supabaseService
    .from('design')
    .select('*, design_part(reference_designator, part(*))')
    .eq('slug', slug)
    .single()

  if (designError) {
    console.log(designError)
    throw new Error(designError.message)
  }

  const { data: repoData, error: repoError } = await supabaseService
    .from('repository')
    .select('description, html_url')
    .eq('id', designData.repository_id)
    .single()

  if (repoError) {
    console.log(repoError)
    throw new Error(repoError.message)
  }
  designData.description = repoData.description
  designData.html_url = repoData.html_url
  return designData
}

// async function fetchCsvData (url) {
//   const response = await fetch(url)

//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`)
//   }
//   const text = await response.text()
//   const parsedData = Papa.parse(text, { header: true })
//   return parsedData
// }

export default async function ({ params }) {
  const slug = (await params).slug
  const design = await getDesignEntry(slug)
  const designUrl = `${process.env.DO_BUCKET_PATH}/repositories/${design.full_path}`
  const pdfUrl = `${designUrl}/schematic.pdf`
  const gerberUrl = `${designUrl}/gerbers.zip`
  const bomUrl = `${designUrl}/bom.csv`
  const iBomUrl = `${designUrl}/ibom.html`

  const sortedDesign = sortParts(design.design_part)
  const parts = sortedDesign.map(({ part }) => part).slice(0, NUM_PARTS_TO_TAG)

  return (
    <div className='w-full max-w-5xl mx-auto px-4'>
      <div className='flex items-start justify-between mt-6'>
        <div>
          <h1 className='text-3xl font-bold'>{design.name}</h1>
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

      <div className='mt-4'>
        <PartTags parts={parts} />
      </div>

      <div className='flex items-center justify-between mt-6 mb-2'>
        <h2 className='text-lg font-bold'>{design.name} schematic</h2>
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
          src={pdfUrl}
          className='w-full h-full'
          title='PDF Viewer'
        />
      </div>
      <div className='flex items-center justify-between mt-6'>
        <h2 className='text-lg font-bold'>{design.name} board layout</h2>
        <div>
          <a
            href={gerberUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-link'
          >
            Download gerbers
            <Download className='h-5 w-5' />
          </a>
          <a
            href={bomUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-link'
          >
            Download BOM
            <Download className='h-5 w-5' />
          </a>
          <a
            href={iBomUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-link'
          >
            Open in new tab
            <ExternalLink className='h-5 w-5' />
          </a>
        </div>
      </div>
      <div className='h-[90vh] w-full mt-2'>
        <BoardView iBomUrl={iBomUrl} />
      </div>
    </div>
  )
}
