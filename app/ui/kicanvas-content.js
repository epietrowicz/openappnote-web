'use client'

import Script from 'next/script'
import { useRef, useEffect, useState } from 'react'

const KicanvasContent = ({ fileUrls }) => {
  const containerRef = useRef(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Build the HTML string for all source elements
    const sourcesHtml = fileUrls
      .map((fileUrl) => `<kicanvas-source src="${fileUrl.replace(/"/g, '&quot;')}"></kicanvas-source>`)
      .join('')

    // Set the innerHTML with the complete structure
    containerRef.current.innerHTML = `<kicanvas-embed controls="full">${sourcesHtml}</kicanvas-embed>`
  }, [fileUrls, scriptLoaded])

  return (
    <>
      <Script
        src='/kicanvas.js'
        strategy='afterInteractive'
        onLoad={() => {
          console.log('Loaded', window.kc)
          setScriptLoaded(true)
        }}
      />
      <div ref={containerRef} />
    </>
  )
}

export default KicanvasContent
