import { cache } from 'react'
import { unstable_cache as unstableCache } from 'next/cache'
import { octokit } from './gh'
import { NUM_RESULTS_PER_PAGE } from './util'

export const searchKicadSchematics = cache(unstableCache(
  async (query, page) => {
    const response = await octokit.search.code({
      q: `${query} in:file extension:kicad_sch`,
      per_page: NUM_RESULTS_PER_PAGE,
      page
    })

    return {
      results: response.data.items,
      totalHits: response.data.total_count
    }
  },
  ['github-search'],
  { revalidate: 3600, tags: ['github-search'] }
))
