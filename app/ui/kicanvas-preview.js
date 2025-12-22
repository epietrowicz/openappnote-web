'use client'
import Script from 'next/script'

const KicanvasPreview = ({ src, controls = 'none', type }) => {
  return (
    <>
      <Script
        src='/kicanvas.js'
        strategy='afterInteractive'
        onLoad={() => {
          console.log('Loaded', window.kc)
        }}
      />
      <kicanvas-embed theme='witchhazel' src={src} controls={controls} type={type} />
    </>
  )
}

export default KicanvasPreview
