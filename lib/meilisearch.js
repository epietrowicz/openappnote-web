import { MeiliSearch } from 'meilisearch'

export const meilisearchClient = new MeiliSearch({
  host: 'https://search.openappnote.dev/',
  apiKey: process.env.MEILISEARCH_SECRET_KEY
})
