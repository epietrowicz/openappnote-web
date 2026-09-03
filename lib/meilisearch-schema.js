import { meilisearchClient } from './meilisearch'

const DESIGNS_INDEX = 'designs'
const CRAWL_STATE_INDEX = 'crawl_state'
const DESIGN_FLAGS_INDEX = 'design_flags'

export function getDesignsIndex (client = meilisearchClient) {
  return client.index(DESIGNS_INDEX)
}

export function getCrawlStateIndex (client = meilisearchClient) {
  return client.index(CRAWL_STATE_INDEX)
}

export function getDesignFlagsIndex (client = meilisearchClient) {
  return client.index(DESIGN_FLAGS_INDEX)
}

async function ignoreIndexExists (promise) {
  try {
    await promise
  } catch (error) {
    if (error?.code !== 'index_already_exists') throw error
  }
}

export async function ensureIndexes (client = meilisearchClient) {
  await ignoreIndexExists(client.createIndex(DESIGNS_INDEX, { primaryKey: 'id' }))
  await ignoreIndexExists(client.createIndex(CRAWL_STATE_INDEX, { primaryKey: 'id' }))
  await ignoreIndexExists(client.createIndex(DESIGN_FLAGS_INDEX, { primaryKey: 'id' }))

  await getDesignsIndex(client).updateSettings({
    searchableAttributes: ['repository.name', 'repository.description', 'projectName', 'tags', 'partNumbers', 'partDescriptions'],
    filterableAttributes: ['repository.owner.login', 'tags', 'hasPcb'],
    sortableAttributes: ['repository.stargazers_count', 'hasPcb', 'partCount'],
    // Text relevance still wins first, but designs with no PCB layout (or a near-
    // empty BOM) are pushed below otherwise-equally-relevant complete designs
    // before popularity (stars) and exactness get a say.
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'hasPcb:desc', 'partCount:desc', 'sort', 'exactness']
  })

  // User-submitted reports, kept separate from `designs` for now - they're for
  // manual review, not yet folded into ranking (see lib/design-flags.js).
  await getDesignFlagsIndex(client).updateSettings({
    filterableAttributes: ['owner', 'repo', 'projectPath', 'reason'],
    sortableAttributes: ['createdAt']
  })
}
