import { getPublicApiUrl } from '@/lib/public-api-url'
import Papa from 'papaparse'

// Same POST github/bom call the design detail page's fetchBom makes, but never
// throws - a BOM failure (service down, timeout, bad response, unparseable CSV)
// shouldn't stop the project from being indexed, just leave its parts empty.
export async function generateBom (rootSchUrl, schematicUrls) {
  try {
    const res = await fetch(`${getPublicApiUrl()}/github/bom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rootUrl: rootSchUrl, urls: schematicUrls })
    })

    if (!res.ok) return []

    const csv = await res.text()
    const { data: parts } = Papa.parse(csv, { header: true, skipEmptyLines: true })
    return parts
  } catch (error) {
    console.error(`BOM generation failed for ${rootSchUrl}:`, error)
    return []
  }
}
