import Link from 'next/link'
import { notFound } from 'next/navigation'
import KicanvasContent from '@/app/ui/kicanvas-content'
import { getPcbViewerFileUrl } from '@/lib/pcb-viewer-s3'

export async function generateMetadata ({ params }) {
  const { file } = await params
  const fileName = decodeURIComponent(file[file.length - 1])

  return {
    title: `${fileName} | Online PCB Viewer`,
    description: `Preview ${fileName} in your browser with the Open App Note online PCB viewer.`
  }
}

export default async function PcbViewerFilePage ({ params }) {
  const { file } = await params
  const filePath = file.map(decodeURIComponent).join('/')
  const fileName = decodeURIComponent(file[file.length - 1])
  const fileUrl = await getPcbViewerFileUrl(filePath)

  if (!fileUrl) {
    notFound()
  }

  return (
    <div className='w-full max-w-6xl mx-auto px-4 py-6'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h1 className='text-2xl font-bold'>{fileName}</h1>
          <p className='text-sm text-base-content/70 mt-1'>PCB board preview</p>
        </div>
        <Link href='/online-pcb-viewer' className='btn btn-ghost btn-sm'>
          Upload another file
        </Link>
      </div>

      <div className='h-[80vh] rounded-box border border-base-300 overflow-hidden'>
        <KicanvasContent fileUrls={[fileUrl]} />
      </div>
    </div>
  )
}
