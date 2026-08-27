import { octokit } from '@/lib/gh'
import { NextResponse } from 'next/server'

export async function GET (request) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Query and page parameters required' }, { status: 400 })
  }

  try {
    const result = await octokit.rest.repos.get({
      owner,
      repo
    })
    return NextResponse.json({ result: result.data })
  } catch (error) {
    console.error('Error fetching search results:', error)
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 })
  }
}
