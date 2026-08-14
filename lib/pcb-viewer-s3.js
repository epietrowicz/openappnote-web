const PCB_VIEWER_S3_PREFIX = 'pcb-viewer'

function getPcbViewerS3BaseUrl () {
  return (
    process.env.NEXT_PUBLIC_PCB_VIEWER_S3_BASE_URL ??
    'https://openappnote-designs-334542936098-us-east-1-an.s3.us-east-1.amazonaws.com/pcb-viewer'
  )
}

export function getPcbViewerObjectKey (filePath) {
  return `${PCB_VIEWER_S3_PREFIX}/${filePath}`
}

export function getPcbViewerPublicUrl (filePath) {
  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/')
  return `${getPcbViewerS3BaseUrl()}/${encodedPath}`
}

export async function getPcbViewerFileUrl (filePath) {
  const fileUrl = getPcbViewerPublicUrl(filePath)

  try {
    const res = await fetch(fileUrl, { method: 'HEAD', next: { revalidate: 60 } })
    if (!res.ok) return null
    return fileUrl
  } catch (err) {
    console.error('Error checking PCB viewer file:', err)
    return null
  }
}
