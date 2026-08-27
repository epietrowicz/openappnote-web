'use client'

import { useCallback } from 'react'
import KicanvasEmbedShell from './kicanvas-embed-shell'
import { mountUrlEmbed } from './kicanvas-dom'

export default function KicanvasRemoteContent ({
  fileUrls = [],
  className = 'w-full h-[80vh]'
}) {
  const onMount = useCallback(
    (container) => mountUrlEmbed(container, fileUrls),
    [fileUrls]
  )

  if (fileUrls.length === 0) {
    return null
  }

  return (
    <KicanvasEmbedShell
      className={className}
      onMount={onMount}
      mountDeps={[fileUrls]}
    />
  )
}
