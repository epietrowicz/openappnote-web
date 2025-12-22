import { octokit } from '@/lib/gh'
import { NextResponse } from 'next/server'

export async function GET (request) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const path = searchParams.get('path')
  const treeSha = searchParams.get('tree_sha')

  if (!owner || !repo || !treeSha) {
    return NextResponse.json({ error: 'Query and page parameters required' }, { status: 400 })
  }

  try {
    const files = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: treeSha,
      recursive: 1
    })

    const filteredFiles = files.data.tree.filter(file =>
      file.type === 'blob' &&
        file.path.startsWith(path)
    )

    const pcbFile = filteredFiles.find(file => file.path.endsWith('.kicad_pcb'))
    const pcbRawPath = `https://raw.githubusercontent.com/${owner}/${repo}/${treeSha}/${path}${pcbFile.path}`
    if (!pcbFile) {
      return NextResponse.json({ error: 'PCB file not found' }, { status: 404 })
    }
    return NextResponse.json({ result: pcbRawPath })
  } catch (error) {
    console.error('Error fetching search results:', error)
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 })
  }
}
