import axios from 'axios'
import Papa from 'papaparse'
import { isGithubPcbUrl, toRawGitHubUrl } from './github-url'

function decodeEncodedFile ({ content }) {
  const binary = atob(content)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function parseBomCsv (csv) {
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true })
  return data
}

function isJsonResponse (contentType) {
  return contentType?.includes('application/json')
}

async function readPcbBlobResponse (res) {
  const blob = res.data
  const contentDisposition = res.headers['content-disposition']
  const content = await blob.text()
  const filename =
    contentDisposition?.match(/filename="([^"]+)"/)?.[1] ??
    'board.kicad_pcb'

  return { fileContent: content, fileName: filename, bomData: null }
}

async function readSchematicBlobResponse (res) {
  const contentType = res.headers['content-type'] ?? ''

  if (!isJsonResponse(contentType)) {
    return readPcbBlobResponse(res)
  }

  const data = JSON.parse(await res.data.text())
  if (!data.schematic?.filename || !data.schematic?.content) {
    throw new Error('Upload response missing schematic file')
  }

  return {
    fileContent: decodeEncodedFile(data.schematic),
    fileName: data.schematic.filename,
    bomData: data.bom ? parseBomCsv(decodeEncodedFile(data.bom)) : null
  }
}

export async function uploadLocalFile (uploadBaseUrl, file) {
  if (file.name.toLowerCase().endsWith('.kicad_pcb')) {
    return {
      fileContent: await file.text(),
      fileName: file.name,
      bomData: null
    }
  }

  const formData = new FormData()
  formData.append('file', file)

  const res = await axios.post(`${uploadBaseUrl}/upload`, formData, {
    responseType: 'blob'
  })

  return readSchematicBlobResponse(res)
}

export async function fetchGithubFile (uploadBaseUrl, githubUrl) {
  const rawUrl = toRawGitHubUrl(githubUrl)
  const endpoint = isGithubPcbUrl(githubUrl) ? '/github/pcb' : '/github/schematic'

  const res = await axios.post(`${uploadBaseUrl}${endpoint}`, { url: rawUrl }, {
    responseType: 'blob'
  })

  return endpoint === '/github/pcb'
    ? readPcbBlobResponse(res)
    : readSchematicBlobResponse(res)
}

export async function formatUploadError (err) {
  if (!axios.isAxiosError(err)) {
    return err instanceof Error ? err.message : String(err)
  }

  const data = err.response?.data
  if (data instanceof Blob) {
    const text = await data.text()
    return text || err.message
  }

  return typeof data === 'string' ? data : data?.message ?? err.message
}
