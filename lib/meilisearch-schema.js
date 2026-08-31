import { meilisearchClient } from './meilisearch'

const DESIGNS_INDEX = 'designs'
const CRAWL_STATE_INDEX = 'crawl_state'

export function getDesignsIndex () {
  return meilisearchClient.index(DESIGNS_INDEX)
}

export function getCrawlStateIndex () {
  return meilisearchClient.index(CRAWL_STATE_INDEX)
}

async function ignoreIndexExists (promise) {
  try {
    await promise
  } catch (error) {
    if (error?.code !== 'index_already_exists') throw error
  }
}

export async function ensureIndexes () {
  await ignoreIndexExists(meilisearchClient.createIndex(DESIGNS_INDEX, { primaryKey: 'id' }))
  await ignoreIndexExists(meilisearchClient.createIndex(CRAWL_STATE_INDEX, { primaryKey: 'id' }))

  await getDesignsIndex().updateSettings({
    searchableAttributes: ['repository.name', 'repository.description', 'projectName', 'tags', 'partNumbers', 'partDescriptions'],
    filterableAttributes: ['repository.owner.login', 'tags'],
    sortableAttributes: ['repository.stargazers_count']
  })
}
