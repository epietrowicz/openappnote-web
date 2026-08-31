import { getPublicApiUrl } from '@/lib/public-api-url'
import Papa from 'papaparse'

const BOM_TIMEOUT_MS = 15_000

// Same POST github/bom call the design detail page's fetchBom makes, but never
// throws - a BOM failure (service down, timeout, bad response, unparseable CSV)
// shouldn't stop the project from being indexed, just leave its parts empty.
// Bounded by BOM_TIMEOUT_MS so one slow/hung response can't monopolize a whole
// crawl invocation's time budget at the expense of every other project queued
// behind it.
export async function generateBom (rootSchUrl, schematicUrls) {
  try {
    const res = await fetch(`${getPublicApiUrl()}/github/bom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rootUrl: rootSchUrl, urls: schematicUrls }),
      signal: AbortSignal.timeout(BOM_TIMEOUT_MS)
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
