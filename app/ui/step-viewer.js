'use client'

import { useEffect, useState } from 'react'

const StepViewer = ({ glbUri }) => {
  const [isClient, setIsClient] = useState(false)
  const [glbDataUri, setGlbDataUri] = useState('')

  useEffect(() => {
    setIsClient(true)
    // Dynamically import model-viewer only on the client side
    import('@google/model-viewer')
  }, [])

  useEffect(() => {
    if (glbUri) {
      setGlbDataUri(glbUri)
    }
  }, [glbUri])

  if (!isClient) {
    return null // or a loading placeholder
  }

  return (
    <div className='h-[80vh]'>
      <model-viewer
        style={{ width: '100%', height: '100%' }}
        src={glbDataUri}
        ar
        ar-modes='webxr scene-viewer quick-look'
        camera-controls tone-mapping='neutral'
        poster='/poster.webp'
        shadow-intensity='1'
      >
        <div className='progress-bar hide' slot='progress-bar'>
          <div className='update-bar' />
        </div>
      </model-viewer>
    </div>
  )
}

export default StepViewer
