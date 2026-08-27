import BomView from './bom-view'
import KicanvasContent from './kicanvas-content'

export default function PcbViewerDisplay ({ fileName, fileContent, bomData, onReset }) {
  return (
    <div className='w-full mt-8'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold'>{fileName.split('.')[0]}</h2>
        <button type='button' className='btn btn-ghost btn-sm' onClick={onReset}>
          Upload another file
        </button>
      </div>

      {bomData && (
        <div className='mb-4'>
          <h3 className='text-lg font-semibold mb-2'>Bill of Materials ({bomData.length})</h3>
          <div className='max-h-56 overflow-y-auto'>
            <BomView data={bomData} />
          </div>
        </div>
      )}

      <div className='h-[80vh] rounded-box border border-base-300 overflow-hidden'>
        <KicanvasContent fileContent={fileContent} fileName={fileName} />
      </div>
    </div>
  )
}
