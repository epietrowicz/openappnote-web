'use client'

import Script from 'next/script'

const KicanvasContent = ({ fileUrls }) => {
  return (
    <>
      <Script
        src='/kicanvas.js'
        strategy='afterInteractive'
        onLoad={() => {
          console.log('Loaded', window.kc)
        }}
      />
      <kicanvas-embed theme='' src={fileUrls[0]} controls='full' type='board' />
    </>
  )
}

export default KicanvasContent
