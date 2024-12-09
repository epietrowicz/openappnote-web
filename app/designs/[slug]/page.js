import { supabaseService } from '@/lib/db'
import { ExternalLink } from 'lucide-react'

// Next.js will invalidate the cache when a
// request comes in, at most once every 60 seconds.
export const revalidate = 60

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true // or false, to 404 on unknown paths

export async function generateStaticParams () {
  const { data, error } = await supabaseService
    .from('design')
    .select('slug')

  if (error) {
    console.log(error)
    return
  }
  return data
}

async function getDesignEntry (slug) {
  const { data, error } = await supabaseService
    .from('design')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.log(error)
    throw new Error(error.message)
  }
  return data
}

export default async function ({ params }) {
  const slug = (await params).slug
  const design = await getDesignEntry(slug)
  const pdfUrl = `https://openappnote-bucket.nyc3.digitaloceanspaces.com/repositories/${design.full_path}/${design.name}.pdf`
  return (
    <div className='w-full max-w-5xl mx-auto px-4'>
      <div className='flex items-center justify-between py-4'>
        <h2 className='text-lg font-bold'>Schematic for {design.name}</h2>
        <a
          href={pdfUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-primary'
        >
          Open in new tab
          <ExternalLink className='h-5 w-5' />
        </a>
      </div>
      <div className='h-[80vh] rounded-sm'>
        <iframe
          src={pdfUrl}
          className='w-full h-full'
          title='PDF Viewer'
        />
      </div>

    </div>
  )
}
