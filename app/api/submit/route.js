import { octokit } from '@/lib/gh'
import { NextResponse } from 'next/server'

const isNestedPath = (path) => {
  if (!path.includes('/tree/')) {
    return false
  }
  if (!path.split('/tree/')[1].includes('/')) {
    return false
  }
  return true
}

const getNestedPath = (path, ref) => {
  const designPath = path.split(`/tree/${ref}/`)[1]
  return decodeURIComponent(designPath)
}

export async function POST (request) {
  const { url } = await request.json()
  const owner = url.split('/')[3]
  const repo = url.split('/')[4]

  if (!url) {
    return NextResponse.json({ error: 'Query and page parameters required' }, { status: 400 })
  }

  try {
    const result = await octokit.rest.repos.get({
      owner,
      repo
    })

    const ref = result.data.default_branch
    const isNested = isNestedPath(url)

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: isNested ? getNestedPath(url, ref) : '',
      ref
    })

    // data is an array for directories
    const files = data
      .filter((item) => item.type === 'file')
      .map((item) => item.path)

    const schematicFile = files.find(file => file.endsWith('.kicad_sch'))

    if (!schematicFile) {
      return NextResponse.json({ error: 'No KiCad files found in this directory!' }, { status: 404 })
    }

    return NextResponse.json({ schPath: schematicFile, owner, repo }, {
      headers: {
        'Cache-Control': 'public, max-age=2592000, immutable'
      }
    })
  } catch (error) {
    console.error('Error fetching search results:', error)
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 })
  }
}
