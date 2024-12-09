import { meilisearchClient } from '@/lib/meilisearch'
import { NextResponse } from 'next/server'

export async function GET (request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  const index = meilisearchClient.index('design')
  const results = await index.search(query)

  return NextResponse.json({ results })
}
