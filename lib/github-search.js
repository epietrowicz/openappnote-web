import { octokit } from './gh'
import { NUM_RESULTS_PER_PAGE } from './util'

export async function searchKicadSchematics (query, page) {
  const response = await octokit.search.code({
    q: `${query} in:file extension:kicad_sch`,
    per_page: NUM_RESULTS_PER_PAGE,
    page
  })

  return {
    results: response.data.items,
    totalHits: response.data.total_count
  }
}
