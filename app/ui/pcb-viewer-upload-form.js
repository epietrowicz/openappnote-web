import { Upload } from 'lucide-react'

export default function PcbViewerUploadForm ({
  status,
  message,
  isDragging,
  githubUrl,
  onGithubUrlChange,
  onGithubSubmit,
  onFileChange,
  dragHandlers
}) {
  return (
    <div className='w-full' {...dragHandlers}>
      <div
        className={`card bg-base-100 h-56 border border-dashed w-3xl mx-auto mt-8 ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
      >
        <div className='card-body flex flex-col items-center justify-center h-full pointer-events-none'>
          {status === 'uploading'
            ? (
              <div className='flex flex-col items-center'>
                <span className='loading loading-spinner loading-lg' />
                <p className='font-medium mt-2'>Processing file...</p>
              </div>
              )
            : (
              <>
                <Upload className='h-12 w-12 opacity-40' />
                <p className='font-medium'>Drop your files here</p>
                <p className='text-sm text-base-content/60'>or choose a file from your computer</p>
                <label htmlFor='pcb-file-input' className='btn btn-outline btn-sm mt-4 pointer-events-auto'>
                  Choose file
                </label>
              </>
              )}
        </div>
      </div>

      <div className='divider max-w-xs mx-auto'>or</div>

      <div className='flex items-center justify-center gap-2 max-w-3xl mx-auto'>
        <input
          type='text'
          placeholder='GitHub link to a design file'
          className='input input-bordered w-full'
          value={githubUrl}
          onChange={e => onGithubUrlChange(e.target.value)}
          disabled={status === 'uploading'}
        />
        <button
          type='button'
          className='btn btn-primary'
          onClick={onGithubSubmit}
          disabled={status === 'uploading' || !githubUrl.trim()}
        >
          Submit
        </button>
      </div>

      <input
        id='pcb-file-input'
        type='file'
        className='hidden'
        accept='.kicad_pcb,.brd,.PcbDoc,.SchDoc,.sch'
        onChange={onFileChange}
        disabled={status === 'uploading'}
      />

      {status === 'error' && message && (
        <div className='alert alert-error mt-4 w-full max-w-3xl mx-auto'>
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}
