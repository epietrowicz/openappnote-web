// One-time backfill: repeatedly calls the /api/cron/crawl route against a
// running server (e.g. `pnpm dev`) so the crawl-state-driven orchestrator makes
// forward progress each round, without waiting on daily Vercel Cron slices.
//
// Usage:
//   CRON_SECRET=... pnpm dev &
//   CRON_SECRET=... node scripts/backfill-crawl.js
//
// To populate the PRODUCTION Meilisearch instance from your locally-running
// server (sidesteps Vercel Deployment Protection entirely, since nothing hits
// the deployed app - the crawl runs locally, it just writes to the remote
// Meilisearch instance instead of the local one):
//   1. In .env.local, set MEILISEARCH_HOST to the production Meilisearch URL
//      and MEILISEARCH_SECRET_KEY to match its master key.
//   2. CRON_SECRET=... pnpm dev &
//   3. CRON_SECRET=... CRAWL_TARGET=production node scripts/backfill-crawl.js
//
// Optional env vars:
//   CRAWL_BASE_URL   defaults to http://localhost:5173
//   CRAWL_ROUNDS     defaults to 20
//   CRAWL_BUDGET_MS  per-round time budget passed to the crawl route
//   CRAWL_TARGET     'local' | 'production' - which Meilisearch instance the
//                    server should crawl into. Omit to let the server decide
//                    based on its own NODE_ENV (its normal default behavior).

const DEFAULT_BASE_URL = 'http://localhost:5173'
const DEFAULT_ROUNDS = 20
const VALID_TARGETS = ['local', 'production']

async function main () {
  const baseUrl = process.env.CRAWL_BASE_URL || DEFAULT_BASE_URL
  const cronSecret = process.env.CRON_SECRET
  const rounds = Number(process.env.CRAWL_ROUNDS || DEFAULT_ROUNDS)
  const budgetMs = process.env.CRAWL_BUDGET_MS
  const target = process.env.CRAWL_TARGET

  if (!cronSecret) {
    console.error('CRON_SECRET is not set. Export it (matching the running server\'s env) before running this script.')
    process.exitCode = 1
    return
  }

  if (target && !VALID_TARGETS.includes(target)) {
    console.error(`CRAWL_TARGET must be one of: ${VALID_TARGETS.join(', ')}`)
    process.exitCode = 1
    return
  }

  for (let round = 1; round <= rounds; round++) {
    const url = new URL('/api/cron/crawl', baseUrl)
    if (budgetMs) url.searchParams.set('budgetMs', budgetMs)
    if (target) url.searchParams.set('target', target)

    console.log(`Backfill round ${round}/${rounds}${target ? ` (target: ${target})` : ''}...`)
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${cronSecret}` }
    })

    if (!response.ok) {
      console.error(`Round ${round} failed with status ${response.status}: ${await response.text()}`)
      process.exitCode = 1
      return
    }

    const summary = await response.json()
    console.log(summary)

    if (summary.queriesProcessed === 0) {
      console.log('No queries processed this round - discovery appears exhausted. Stopping.')
      return
    }
  }
}

main()
