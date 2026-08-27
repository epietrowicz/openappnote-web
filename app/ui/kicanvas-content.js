'use client'

import { useCallback } from 'react'
import KicanvasEmbedShell from './kicanvas-embed-shell'
import { mountInlineEmbed, mountSingleSrcEmbed } from './kicanvas-dom'

export default function KicanvasContent ({
  fileUrls,
  fileContent,
  fileName = 'board'
}) {
  const onMount = useCallback((container) => {
    if (fileContent != null) {
      mountInlineEmbed(container, { fileContent, fileName })
    } else if (fileUrls?.[0]) {
      mountSingleSrcEmbed(container, fileUrls[0])
    }
  }, [fileContent, fileName, fileUrls])

  return (
    <KicanvasEmbedShell
      onMount={onMount}
      mountDeps={[fileContent, fileName, fileUrls]}
    />
  )
}
