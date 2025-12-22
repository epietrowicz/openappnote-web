import { octokit } from '@/lib/gh'
import { NextResponse } from 'next/server'

export async function GET (request) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const path = searchParams.get('path')
  const ref = searchParams.get('ref')

  if (!owner || !repo || !ref) {
    return NextResponse.json({ error: 'Owner, repo, and ref parameters required' }, { status: 400 })
  }

  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref
    })
    if (!response.data) {
      return NextResponse.json({ error: 'Schematic file not found' }, { status: 404 })
    }
    return NextResponse.json({ result: response.data.content }, {
      headers: {
        'Cache-Control': 'public, max-age=2592000, immutable'
      }
    })
  } catch (error) {
    console.error('Error fetching search results:', error)
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 })
  }
}
