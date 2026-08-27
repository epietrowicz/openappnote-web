export function getFilenameFromGithubUrl (urlString) {
  try {
    const url = new URL(urlString.trim())
    if (url.hostname === 'raw.githubusercontent.com') {
      return decodeURIComponent(url.pathname.split('/').pop())
    }
    if (url.hostname === 'github.com') {
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[2] === 'blob' && parts.length >= 5) {
        return decodeURIComponent(parts[parts.length - 1])
      }
    }
  } catch {
    return ''
  }
  return ''
}

export function isGithubPcbUrl (urlString) {
  const lower = getFilenameFromGithubUrl(urlString).toLowerCase()
  return lower.endsWith('.kicad_pcb') || lower.endsWith('.brd') || lower.endsWith('.pcbdoc')
}

export function toRawGitHubUrl (urlString) {
  const trimmed = urlString.trim()
  try {
    const url = new URL(trimmed)
    if (url.hostname === 'raw.githubusercontent.com') return url.href
    if (url.hostname === 'github.com') {
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[2] === 'blob' && parts.length >= 5) {
        const [owner, repo, , ref, ...pathParts] = parts
        return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${pathParts.join('/')}`
      }
    }
  } catch {
    return trimmed
  }
  return trimmed
}
