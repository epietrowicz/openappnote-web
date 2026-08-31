import { getDesignsIndex } from './meilisearch-schema'
import { NUM_RESULTS_PER_PAGE } from './util'
import { normalizeTag, isCuratedTag } from './tags'

function escapeFilterValue (value) {
  return value.replaceAll('"', '\\"')
}

export async function searchDesigns (query, page) {
  const index = getDesignsIndex()
  const options = {
    page,
    hitsPerPage: NUM_RESULTS_PER_PAGE,
    sort: ['repository.stargazers_count:desc']
  }

  const ownerMatch = query.match(/^user:(.+)$/)
  if (ownerMatch) {
    options.filter = `repository.owner.login = "${escapeFilterValue(ownerMatch[1])}"`
    const { hits, totalHits } = await index.search('', options)
    return { results: hits, totalHits }
  }

  // Curated tags still get full-text search, not a `tags`-array filter - the
  // filter only matches documents matchTags() tagged at crawl time from repo
  // name/description/topics, which misses genuine matches that only show up in
  // partNumbers/partDescriptions (the whole point of seeding search from the BOM).
  const searchQuery = isCuratedTag(query) ? normalizeTag(query) : query
  const { hits, totalHits } = await index.search(searchQuery, options)
  return { results: hits, totalHits }
}
