/* eslint-env browser */

export function escapeAttr (value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function mountUrlEmbed (container, urls) {
  if (urls.length === 0) return

  const sourceTags = urls
    .map(url => `<kicanvas-source src="${escapeAttr(url)}"></kicanvas-source>`)
    .join('')

  const template = document.createElement('template')
  template.innerHTML =
    `<kicanvas-embed controls="full" theme="kicad">${sourceTags}</kicanvas-embed>`

  container.replaceChildren(template.content.firstElementChild)
}

export function mountInlineEmbed (container, { fileContent, fileName }) {
  const template = document.createElement('template')
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
}

export function mountSingleSrcEmbed (container, src) {
  const template = document.createElement('template')
  template.innerHTML =
    `<kicanvas-embed src="${escapeAttr(src)}" controls="full" theme="kicad"></kicanvas-embed>`
  container.replaceChildren(template.content.firstElementChild)
}

export function isKicanvasReady () {
  return typeof customElements !== 'undefined' && customElements.get('kicanvas-embed') != null
}
