import { meilisearchClient } from './meilisearch'

const DESIGNS_INDEX = 'designs'
const CRAWL_STATE_INDEX = 'crawl_state'

export function getDesignsIndex (client = meilisearchClient) {
  return client.index(DESIGNS_INDEX)
}

export function getCrawlStateIndex (client = meilisearchClient) {
  return client.index(CRAWL_STATE_INDEX)
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

  await getDesignsIndex(client).updateSettings({
    searchableAttributes: ['repository.name', 'repository.description', 'projectName', 'tags', 'partNumbers', 'partDescriptions'],
    filterableAttributes: ['repository.owner.login', 'tags'],
    sortableAttributes: ['repository.stargazers_count']
  })
}
