'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUp, Upload } from 'lucide-react'
import axios from 'axios'

export default function PcbViewerUpload () {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | error
  const [message, setMessage] = useState('')

  const uploadBaseUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL

  function handleFileChange (e) {
    setSelectedFile(e.target.files?.[0] ?? null)
    setStatus('idle')
    setMessage('')
  }

  async function handleUpload (e) {
    e.preventDefault()
    if (!selectedFile || status === 'uploading') return

    setStatus('uploading')
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await axios.post(`${uploadBaseUrl}/upload`, formData)
      const { convertedKey } = res.data

      if (!convertedKey) {
        throw new Error('Upload succeeded but no file key was returned')
      }

      const viewerPath = convertedKey
        .split('/')
        .map(encodeURIComponent)
        .join('/')

      router.push(`/online-pcb-viewer/${viewerPath}`)
    } catch (err) {
      setStatus('error')
      if (axios.isAxiosError(err)) {
        const data = err.response?.data
        setMessage(
          typeof data === 'string'
            ? data
            : data?.message ?? err.message
        )
      } else {
        setMessage(err instanceof Error ? err.message : String(err))
      }
    }
  }

  return (
    <>
      <form onSubmit={handleUpload} className='w-full'>
        <div className='card bg-base-100 border border-dashed border-base-300 w-full mt-8'>
          <div className='card-body items-center'>
            <Upload className='h-12 w-12 opacity-40' />
            <p className='font-medium'>Drop your files here</p>
            <p className='text-sm text-base-content/60'>or choose a file from your computer</p>
            <input
              type='file'
              className='file-input file-input-bordered file-input-primary w-full max-w-xs mt-4'
              accept='.kicad_pcb,.kicad_pro,.zip,.gbr,.gbl,.gtl,.gbs,.gts,.gbo,.gto,.gko,.brd'
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* {selectedFile && (
          <div className='alert alert-info mt-4 w-full'>
            <FileUp className='h-5 w-5' />
            <span>Selected: {selectedFile.name}</span>
          </div>
        )} */}

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
    </>
  )
}
