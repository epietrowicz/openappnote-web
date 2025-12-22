import React from 'react'
import KicanvasContent from '@/app/ui/kicanvas-content'

async function fetchSch (fileApiUrl) {
  const res = await fetch(fileApiUrl, {
    next: { revalidate: 2592000 }
  })
  if (!res.ok) {
    return null
  }
  const data = await res.text()
  return data
}

const KicanvasContainer = async ({ fileUrls }) => {
  return (
    <div>
      <KicanvasContent fileUrls={fileUrls} />
    </div>
  )
}

export default KicanvasContainer
