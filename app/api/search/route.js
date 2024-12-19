import { meilisearchClient } from '@/lib/meilisearch'
import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import { NextResponse } from 'next/server'

export async function GET (request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const page = searchParams.get('page')

  if (!query || !page) {
    return NextResponse.json({ error: 'Query and page parameters required' }, { status: 400 })
  }

  const offset = (page - 1) * NUM_RESULTS_PER_PAGE
  const index = meilisearchClient.index('design')
  const results = await index.search(query, {
    limit: NUM_RESULTS_PER_PAGE,
    offset
  })

  return NextResponse.json({ results })
}
