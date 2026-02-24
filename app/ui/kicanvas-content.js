'use client'

import Script from 'next/script'
import { useFlags } from 'launchdarkly-react-client-sdk'

const KicanvasContent = ({ fileUrls }) => {
  const flags = useFlags()
  const interactivePcb = flags?.interactivePcbViewer ?? false

  return (
    <>
      <Script
        src='/kicanvas.js'
        strategy='afterInteractive'
        onLoad={() => {
          console.log('Loaded', window.kc)
        }}
      />
      <kicanvas-embed
        key={interactivePcb ? 'full' : 'basic'}
        theme=''
        src={fileUrls[0]}
        controls={interactivePcb ? 'full' : 'basic'}
        type='board'
      />
    </>
  )
}

export default KicanvasContent
