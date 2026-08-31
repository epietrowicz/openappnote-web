import { octokit } from '@/lib/gh'

export const CODE_RESULTS_PER_PAGE = 100
export const SEARCH_RESULT_CAP = 1000

// GitHub only indexes files under ~384KB for code search - a generous ceiling for the top bucket.
const MAX_FILE_SIZE = 400_000

const INITIAL_RANGES = [
  { min: 0, max: 1000 },
  { min: 1000, max: 5000 },
  { min: 5000, max: 20000 },
  { min: 20000, max: 50000 },
  { min: 50000, max: 100000 },
  { min: 100000, max: MAX_FILE_SIZE }
]

export function getInitialSizeRanges () {
  return INITIAL_RANGES
}

export function rangeId ({ min, max }) {
  return `code-search-size-${min}-${max}`
}

export function rangeQuery ({ min, max }) {
  return `extension:kicad_sch size:${min}..${max}`
}

// Halves a range for re-querying when its result count exceeds GitHub's
// 1000-per-query cap. Returns null once the range can't usefully be split further.
export function splitRange ({ min, max }) {
  const mid = Math.floor((min + max) / 2)
  if (mid <= min || mid >= max) return null
  return [{ min, max: mid }, { min: mid, max }]
}

export async function searchCodePage (query, page) {
  const response = await octokit.search.code({
    q: query,
    per_page: CODE_RESULTS_PER_PAGE,
    page
  })
  return { items: response.data.items, totalCount: response.data.total_count }
}
