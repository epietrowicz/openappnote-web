'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import axios from 'axios'
import KicanvasContent from './kicanvas-content'

export default function PcbViewerUpload () {
  const [selectedFile, setSelectedFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | error
  const [message, setMessage] = useState('')
  const [fileContent, setFileContent] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const uploadBaseUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL

  function resetViewer () {
    setFileContent(null)
    setFileName(null)
    setSelectedFile(null)
    setStatus('idle')
    setMessage('')
  }

  async function uploadFile (file) {
    if (!file || status === 'uploading') return

    setSelectedFile(file)
    setStatus('uploading')
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await axios.post(`${uploadBaseUrl}/upload`, formData, {
        responseType: 'blob'
      })

      const blob = res.data
      const contentDisposition = res.headers['content-disposition']
      const filename =
        contentDisposition?.match(/filename="([^"]+)"/)?.[1] ??
        'board.kicad_pcb'

      const content = await blob.text()
      setFileContent(content)
      setFileName(filename)
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      if (axios.isAxiosError(err)) {
        const data = err.response?.data
        if (data instanceof Blob) {
          const text = await data.text()
          setMessage(text || err.message)
        } else {
          setMessage(
            typeof data === 'string'
              ? data
              : data?.message ?? err.message
          )
        }
      } else {
        setMessage(err instanceof Error ? err.message : String(err))
      }
    }
  }

  function handleFileChange (e) {
    uploadFile(e.target.files?.[0])
  }

  function handleDragEnter (e) {
    e.preventDefault()
    dragCounter.current += 1
    setIsDragging(true)
  }

  function handleDragOver (e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function handleDragLeave (e) {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDragging(false)
    }
  }

  function handleDrop (e) {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    uploadFile(e.dataTransfer.files?.[0])
  }

  async function handleUpload (e) {
    e.preventDefault()
    await uploadFile(selectedFile)
  }

  if (fileContent) {
    return (
      <div className='w-full mt-8'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold'>{fileName}</h2>
          <button type='button' className='btn btn-ghost btn-sm' onClick={resetViewer}>
            Upload another file
          </button>
        </div>
        <div className='h-[80vh] rounded-box border border-base-300 overflow-hidden'>
          <KicanvasContent fileContent={fileContent} fileName={fileName} />
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleUpload}
      className='w-full'
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`card bg-base-100 border border-dashed w-full mt-8 ${isDragging ? 'border-primary bg-primary/5' : 'border-base-300'}`}
      >
        <div className='card-body items-center pointer-events-none'>
          <Upload className='h-12 w-12 opacity-40' />
          <p className='font-medium'>Drop your files here</p>
          <p className='text-sm text-base-content/60'>or choose a file from your computer</p>
          {selectedFile && status !== 'uploading' && (
            <p className='text-sm mt-2'>{selectedFile.name}</p>
          )}
          <label htmlFor='pcb-file-input' className='btn btn-outline btn-sm mt-4 pointer-events-auto'>
            Choose file
          </label>
        </div>
      </div>

      <input
        id='pcb-file-input'
        type='file'
        className='hidden'
        accept='.kicad_pcb,.kicad_pro,.zip,.gbr,.gbl,.gtl,.gbs,.gts,.gbo,.gto,.gko,.brd'
        onChange={handleFileChange}
      />

      {status === 'error' && message && (
        <div className='alert alert-error mt-4 w-full'>
          <span>{message}</span>
        </div>
      )}

      <button
        type='submit'
        className='btn btn-primary mt-8'
        disabled={!selectedFile || status === 'uploading'}
      >
        {status === 'uploading' && <span className='loading loading-spinner' />}
        View PCB
      </button>
    </form>
  )
}
