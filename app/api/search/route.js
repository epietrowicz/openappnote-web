import { supabaseService } from '@/lib/db'
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

  const searchResult = await index.search(query, {
    limit: NUM_RESULTS_PER_PAGE,
    offset,
    matchingStrategy: 'all'
  })

  const promises = searchResult.hits.map(async (design) => {
    const { data, error } = await supabaseService
      .from('design')
      .select('*, repository(id, stars, avatar_url)')
      .eq('id', design.id)
      .single()

    if (error) {
      console.log(error)
      return {}
    }
    return data
  })
  const results = await Promise.all(promises)

  return NextResponse.json({ results, totalHits: searchResult.estimatedTotalHits })
}
