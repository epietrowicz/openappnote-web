import { MeiliSearch } from 'meilisearch'

function isProduction () {
  return process.env.NODE_ENV === 'production'
}

function getMeilisearchHost () {
  if (isProduction()) {
    return process.env.MEILISEARCH_HOST
  }
  return process.env.MEILISEARCH_LOCAL_HOST ?? 'http://127.0.0.1:7700'
}

export const meilisearchClient = new MeiliSearch({
  host: getMeilisearchHost(),
  apiKey: process.env.MEILISEARCH_SECRET_KEY
})
