import { getPublicApiUrl } from './public-api-url'

export async function fetchModel (pcbUrl) {
  const res = await fetch(`${getPublicApiUrl()}/github/model`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: pcbUrl }),
    next: { revalidate: 86400 }
  })

  if (!res.ok) return null

  const buffer = Buffer.from(await res.arrayBuffer())
  return buffer.toString('base64')
}
