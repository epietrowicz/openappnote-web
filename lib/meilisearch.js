import { MeiliSearch } from 'meilisearch'

function isProduction () {
  return process.env.NODE_ENV === 'production'
}

const HOSTS = {
  local: () => process.env.MEILISEARCH_LOCAL_HOST ?? 'http://127.0.0.1:7700',
  production: () => process.env.MEILISEARCH_HOST
}

// target: 'local' | 'production' | undefined (auto-picks based on NODE_ENV, same
// as before). Lets a locally-running server explicitly target the production
// instance (e.g. for a backfill) without changing what NODE_ENV it's running as.
export function createMeilisearchClient (target) {
  const resolveHost = HOSTS[target] ?? (isProduction() ? HOSTS.production : HOSTS.local)
  return new MeiliSearch({
    host: resolveHost(),
    apiKey: process.env.MEILISEARCH_SECRET_KEY
  })
}

// The site's own read path (lib/design-search.js) always goes through this
// singleton, so MEILISEARCH_TARGET is the one env var that redirects live
// search - e.g. set it to 'production' locally to search against the deployed
// instance without changing NODE_ENV. Unset means the previous NODE_ENV-based
// auto behavior, unchanged.
export const meilisearchClient = createMeilisearchClient(process.env.MEILISEARCH_TARGET)
