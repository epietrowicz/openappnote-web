import { NextResponse } from 'next/server'
import { createMeilisearchClient } from '@/lib/meilisearch'
import { ensureIndexes } from '@/lib/meilisearch-schema'
import { runChannelACrawl } from '@/lib/crawler/run-crawl-code-search'

export const maxDuration = 300

const DEFAULT_BUDGET_MS = 270_000
const VALID_TARGETS = ['local', 'production']

export async function GET (request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)

  const requestedBudgetMs = Number(url.searchParams.get('budgetMs'))
  const budgetMs = Number.isFinite(requestedBudgetMs) && requestedBudgetMs > 0
    ? requestedBudgetMs
    : DEFAULT_BUDGET_MS

  const requestedTarget = url.searchParams.get('target')
  if (requestedTarget && !VALID_TARGETS.includes(requestedTarget)) {
    return NextResponse.json({ error: `target must be one of: ${VALID_TARGETS.join(', ')}` }, { status: 400 })
  }
  const client = createMeilisearchClient(requestedTarget)

  try {
    await ensureIndexes(client)
    const summary = await runChannelACrawl({ budgetMs, client })
    return NextResponse.json({ ...summary, target: requestedTarget ?? 'auto' })
  } catch (error) {
    console.error('Crawl failed:', error)
    return NextResponse.json({
      error: error.message ?? 'Crawl failed',
      target: requestedTarget ?? 'auto'
    }, { status: 500 })
  }
}
