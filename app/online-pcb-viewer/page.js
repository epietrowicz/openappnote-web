import PcbViewerUpload from '../ui/pcb-viewer-upload'

export const metadata = {
  title: 'Online PCB Viewer | Open App Note',
  description: 'Upload and preview KiCad, Gerber, and other PCB design files in your browser.'
}

const ACCEPTED_FORMATS = [
  'KiCad (.kicad_pcb, .kicad_pro)',
  'Gerber files (.gbr, .gbl, .gtl, ...)',
  'ZIP archive containing PCB files'
]

export default function OnlinePcbViewerPage () {
  return (
    <div className='flex flex-col items-center justify-center p-4'>
      <div className='max-w-6xl w-full flex flex-col items-center text-center'>
        <h1 className='text-3xl font-bold'>Online PCB Viewer</h1>
        <p className='mt-2 text-base-content/70'>
          Upload a PCB design file to preview it in your browser.
        </p>

        <PcbViewerUpload />

        {/* <div className='mt-6 w-full text-left'>
          <h2 className='text-sm font-semibold uppercase tracking-wide text-base-content/60'>
            Supported formats
          </h2>
          <ul className='mt-2 list-disc list-inside text-sm text-base-content/70'>
            {ACCEPTED_FORMATS.map((format) => (
              <li key={format}>{format}</li>
            ))}
          </ul>
        </div> */}
      </div>
    </div>
  )
}
