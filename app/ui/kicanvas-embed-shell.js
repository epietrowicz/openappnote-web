'use client'

/* eslint-env browser */

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { isKicanvasReady } from './kicanvas-dom'

export default function KicanvasEmbedShell ({
  className = 'w-full h-full',
  onMount,
  mountDeps = []
}) {
  const containerRef = useRef(null)
  const [ready, setReady] = useState(isKicanvasReady)

  useEffect(() => {
    const container = containerRef.current
    if (!ready || !container) return

    let cancelled = false

    customElements.whenDefined('kicanvas-embed').then(() => {
      if (cancelled) return
      onMount(container)
    })

    return () => {
      cancelled = true
      container.replaceChildren()
    }
  }, [ready, onMount, ...mountDeps])

  return (
    <>
      <Script
        src='/kicanvas.js'
        type='module'
        strategy='afterInteractive'
        onLoad={() => setReady(true)}
      />
      <div ref={containerRef} className={className} />
    </>
  )
}
