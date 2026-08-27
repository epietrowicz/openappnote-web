'use client'

import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { fetchGithubFile, formatUploadError, uploadLocalFile } from '@/lib/pcb-viewer-import'
import PcbViewerDisplay from './pcb-viewer-display'
import PcbViewerUploadForm from './pcb-viewer-upload-form'

export default function PcbViewerUpload () {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [fileContent, setFileContent] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [githubUrl, setGithubUrl] = useState('')
  const [bomData, setBomData] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const isUploading = useRef(false)

  const uploadBaseUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL

  function resetViewer () {
    setFileContent(null)
    setFileName(null)
    setBomData(null)
    setGithubUrl('')
    setStatus('idle')
    setMessage('')
  }

  async function runImport (importFn, { toastOnError = false } = {}) {
    if (isUploading.current) return

    isUploading.current = true
    setStatus('uploading')
    setMessage('')

    try {
      const result = await importFn()
      setFileContent(result.fileContent)
      setFileName(result.fileName)
      setBomData(result.bomData)
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setMessage(await formatUploadError(err))
      if (toastOnError) toast.error('Failed to fetch file from GitHub')
    } finally {
      isUploading.current = false
    }
  }

  function processFile (file) {
    if (!file) return
    runImport(() => uploadLocalFile(uploadBaseUrl, file))
  }

  function handleGithubSubmit () {
    if (!githubUrl.trim()) return
    runImport(() => fetchGithubFile(uploadBaseUrl, githubUrl), { toastOnError: true })
  }

  const dragHandlers = {
    onDragEnter: (e) => {
      e.preventDefault()
      dragCounter.current += 1
      setIsDragging(true)
    },
    onDragOver: (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    onDragLeave: (e) => {
      e.preventDefault()
      dragCounter.current -= 1
      if (dragCounter.current <= 0) {
        dragCounter.current = 0
        setIsDragging(false)
      }
    },
    onDrop: (e) => {
      e.preventDefault()
      dragCounter.current = 0
      setIsDragging(false)
      processFile(e.dataTransfer.files?.[0])
    }
  }

  if (fileContent) {
    return (
      <PcbViewerDisplay
        fileName={fileName}
        fileContent={fileContent}
        bomData={bomData}
        onReset={resetViewer}
      />
    )
  }

  return (
    <PcbViewerUploadForm
      status={status}
      message={message}
      isDragging={isDragging}
      githubUrl={githubUrl}
      onGithubUrlChange={setGithubUrl}
      onGithubSubmit={handleGithubSubmit}
      onFileChange={(e) => {
        processFile(e.target.files?.[0])
        e.target.value = ''
      }}
      dragHandlers={dragHandlers}
    />
  )
}
