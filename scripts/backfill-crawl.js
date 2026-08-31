// One-time local backfill: repeatedly calls the /api/cron/crawl route against a
// running server (e.g. `pnpm dev`) so the crawl-state-driven orchestrator makes
// forward progress each round, without waiting on daily Vercel Cron slices.
//
// Usage:
//   CRON_SECRET=... pnpm dev &
//   CRON_SECRET=... node scripts/backfill-crawl.js
//
// Optional env vars:
//   CRAWL_BASE_URL   defaults to http://localhost:5173
//   CRAWL_ROUNDS     defaults to 20
//   CRAWL_BUDGET_MS  per-round time budget passed to the crawl route

const DEFAULT_BASE_URL = 'http://localhost:5173'
const DEFAULT_ROUNDS = 20

async function main () {
  const baseUrl = process.env.CRAWL_BASE_URL || DEFAULT_BASE_URL
  const cronSecret = process.env.CRON_SECRET
  const rounds = Number(process.env.CRAWL_ROUNDS || DEFAULT_ROUNDS)
  const budgetMs = process.env.CRAWL_BUDGET_MS

  if (!cronSecret) {
    console.error('CRON_SECRET is not set. Export it (matching the running server\'s env) before running this script.')
    process.exitCode = 1
    return
  }

  for (let round = 1; round <= rounds; round++) {
    const url = new URL('/api/cron/crawl', baseUrl)
    if (budgetMs) url.searchParams.set('budgetMs', budgetMs)

    console.log(`Backfill round ${round}/${rounds}...`)
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
