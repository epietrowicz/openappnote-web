import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import { octokit } from '@/lib/gh'
import { NextResponse } from 'next/server'

export async function GET (request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const page = searchParams.get('page')

  if (!query || !page) {
    return NextResponse.json({ error: 'Query and page parameters required' }, { status: 400 })
  }

  try {
    const response = await octokit.search.code({
      q: `${query} in:file extension:kicad_sch`,
      per_page: NUM_RESULTS_PER_PAGE,
      page
    })
    return NextResponse.json({ results: response.data.items, totalHits: response.data.total_count }, {
      headers: {
        'Cache-Control': 'public, max-age=2592000, immutable'
      }
    })
  } catch (error) {
    console.error('Error fetching search results:', error)
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 })
  }
}
