import { NextResponse } from 'next/server'
import { ensureIndexes } from '@/lib/meilisearch-schema'
import { runChannelACrawl } from '@/lib/crawler/run-crawl-code-search'

export const maxDuration = 300

const DEFAULT_BUDGET_MS = 270_000

export async function GET (request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const requestedBudgetMs = Number(new URL(request.url).searchParams.get('budgetMs'))
  const budgetMs = Number.isFinite(requestedBudgetMs) && requestedBudgetMs > 0
    ? requestedBudgetMs
    : DEFAULT_BUDGET_MS

  await ensureIndexes()
  const summary = await runChannelACrawl({ budgetMs })

  return NextResponse.json(summary)
}
