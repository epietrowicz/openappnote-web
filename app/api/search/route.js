import { octokit } from '@/lib/gh'
import { meilisearchClient } from '@/lib/meilisearch'
import { NUM_RESULTS_PER_PAGE } from '@/lib/util'
import { NextResponse } from 'next/server'

async function getRepositoryInfo (design) {
  console.log(design)
  const owner = design.full_path.split('/')[0]
  const repo = design.full_path.split('/')[1]
  const result = await octokit.rest.repos.get({
    owner,
    repo
  })
  return {
    ...design,
    stars: result.data.stargazers_count
  }
}

export async function GET (request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const page = searchParams.get('page')

  if (!query || !page) {
    return NextResponse.json({ error: 'Query and page parameters required' }, { status: 400 })
  }

  const offset = (page - 1) * NUM_RESULTS_PER_PAGE
  const index = meilisearchClient.index('design')
  const { hits } = await index.search(query, {
    limit: NUM_RESULTS_PER_PAGE,
    offset
  })
  const promises = hits.map(design => getRepositoryInfo(design))
  const results = await Promise.all(promises)

  return NextResponse.json({ results })
}
