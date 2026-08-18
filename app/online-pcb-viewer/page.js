import PcbViewerUpload from '../ui/pcb-viewer-upload'

export const metadata = {
  title: 'Online PCB Viewer | Open App Note',
  description: 'Upload and preview KiCad, Altium, Eagle, and other PCB design files in your browser.'
}

export default function OnlinePcbViewerPage () {
  return (
    <div className='flex flex-col items-center justify-center p-4'>
      <div className='max-w-6xl w-full flex flex-col items-center text-center'>
        <h1 className='text-3xl font-bold'>Online PCB Viewer</h1>
        <p className='mt-2 text-base-content/70'>
          Upload a KiCad, Altium, or Eagle design file to preview it in your browser.
        </p>

        <PcbViewerUpload />
      </div>
    </div>
  )
}
