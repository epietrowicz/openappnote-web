'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import axios from 'axios'
import Papa from 'papaparse'
import BomView from './bom-view'
import KicanvasContent from './kicanvas-content'

export default function PcbViewerUpload () {
  const [status, setStatus] = useState('idle') // idle | uploading | error
  const [message, setMessage] = useState('')
  const [fileContent, setFileContent] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [bomData, setBomData] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const isUploading = useRef(false)

  const uploadBaseUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL

  function decodeEncodedFile ({ content }) {
    const binary = atob(content)
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  }

  function isJsonUploadResponse (contentType) {
    return contentType?.includes('application/json')
  }

  function isKicadFile (file) {
    return file.name.toLowerCase().endsWith('.kicad_pcb')
  }

  function parseBomCsv (csv) {
    const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true })
    return data
  }

  function resetViewer () {
    setFileContent(null)
    setFileName(null)
    setBomData(null)
    setStatus('idle')
    setMessage('')
  }

  async function processFile (file) {
    if (!file || isUploading.current) return

    isUploading.current = true
    setStatus('uploading')
    setMessage('')

    try {
      if (isKicadFile(file)) {
        setFileContent(await file.text())
        setFileName(file.name)
        setBomData(null)
        setStatus('idle')
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const res = await axios.post(`${uploadBaseUrl}/upload`, formData, {
        responseType: 'blob'
      })

      const contentType = res.headers['content-type'] ?? ''

      if (isJsonUploadResponse(contentType)) {
        const data = JSON.parse(await res.data.text())

        if (!data.schematic?.filename || !data.schematic?.content) {
          throw new Error('Upload response missing schematic file')
        }

        setFileContent(decodeEncodedFile(data.schematic))
        setFileName(data.schematic.filename)
        setBomData(data.bom ? parseBomCsv(decodeEncodedFile(data.bom)) : null)
        setStatus('idle')
        return
      }

      const blob = res.data
      const contentDisposition = res.headers['content-disposition']
      const content = await blob.text()
      const filename =
        contentDisposition?.match(/filename="([^"]+)"/)?.[1] ??
        'board.kicad_pcb'

      setBomData(null)
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
    } finally {
      isUploading.current = false
    }
  }

  function handleFileChange (e) {
    processFile(e.target.files?.[0])
    e.target.value = ''
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
    processFile(e.dataTransfer.files?.[0])
  }

  if (fileContent) {
    return (
      <div className='w-full mt-8'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold'>{fileName.split('.')[0]}</h2>
          <button type='button' className='btn btn-ghost btn-sm' onClick={resetViewer}>
            Upload another file
          </button>
        </div>
        {bomData && (
          <div className='mb-4'>
            <h3 className='text-lg font-semibold mb-2'>Bill of Materials ({bomData.length})</h3>
            <div className='max-h-56 overflow-y-auto rounded-box border border-base-300'>
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

  return (
    <div
      className='w-full'
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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

      <input
        id='pcb-file-input'
        type='file'
        className='hidden'
        accept='.kicad_pcb,.brd,.PcbDoc,.SchDoc,.sch'
        onChange={handleFileChange}
        disabled={status === 'uploading'}
      />

      {status === 'error' && message && (
        <div className='alert alert-error mt-4 w-full'>
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}
