'use client'

/* eslint-env browser */

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

function escapeAttr (value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function mountEmbed (container, { fileContent, fileName, src }) {
  const template = document.createElement('template')

  if (fileContent != null) {
    template.innerHTML =
      '<kicanvas-embed controls="full" theme="kicad">' +
      `<kicanvas-source name="${escapeAttr(fileName)}"></kicanvas-source></kicanvas-embed>`

    const embed = template.content.firstElementChild
    const source = embed.querySelector('kicanvas-source')
    source.appendChild(document.createTextNode(fileContent))

    container.replaceChildren(embed)

    // KiCanvas checks `src === null`; Lit leaves it undefined on createElement.
    source.is_inline_source = () => true
    source.load_inline_source = () => new File([fileContent], fileName, { type: 'text/plain' })
  } else if (src) {
    template.innerHTML =
      `<kicanvas-embed src="${escapeAttr(src)}" controls="full" theme="kicad"></kicanvas-embed>`
    container.replaceChildren(template.content.firstElementChild)
  }
}

export default function KicanvasContent ({
  fileUrls,
  fileContent,
  fileName = 'board'
}) {
  const containerRef = useRef(null)
  const [ready, setReady] = useState(
    () => customElements.get('kicanvas-embed') != null
  )

  useEffect(() => {
    const container = containerRef.current
    if (!ready || !container) return

    let cancelled = false

    customElements.whenDefined('kicanvas-embed').then(() => {
      if (cancelled) return
      mountEmbed(container, { fileContent, fileName, src: fileUrls?.[0] })
    })

    return () => {
      cancelled = true
      container.replaceChildren()
    }
  }, [ready, fileUrls, fileContent, fileName])

  return (
    <>
      <Script
        src='/kicanvas.js'
        type='module'
        strategy='afterInteractive'
        onLoad={() => setReady(true)}
      />
      <div ref={containerRef} className='w-full h-full' />
    </>
  )
}
