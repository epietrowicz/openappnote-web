import { octokit } from '@/lib/gh'
import { NextResponse } from 'next/server'

export async function GET (request) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const path = searchParams.get('path')
  const ref = searchParams.get('ref')
  if (!owner || !repo || !ref) {
    return NextResponse.json({ error: 'Query and page parameters required' }, { status: 400 })
  }

  try {
    // Subtract 1 to get the count of the slashes in the path
    // const depth = (path.split('/').length) - 1
    // const isNestedFile = depth > 1

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref
    })

    // console.log(data)

    // const files = await octokit.rest.git.getTree({
    //   owner,
    //   repo,
    //   tree_sha: ref,
    //   recursive: isNestedFile
    // })
    // // console.log(files.data.tree)
    // const filteredFiles = files.data.tree.filter(file => {
    //   // Only include files
    //   if (file.type !== 'blob') return false
    //   // Only include files that start with the base path
    //   if (!file.path.startsWith(path)) return false

    //   // Get the part of the path after the base path
    //   const remainingPath = file.path.slice(path.length)
    //   // If it starts with a slash, remove it
    //   const relativePath = remainingPath.startsWith('/') ? remainingPath.slice(1) : remainingPath
    //   // Ignore files in subdirectories (if there's a slash, it's in a subdirectory)
    //   if (relativePath.includes('/')) return false
    //   return true
    // })
    // const projectFiles = filteredFiles.filter(file => file.path.endsWith('.kicad_sch') || file.path.endsWith('.kicad_pcb') || file.path.endsWith('.kicad_pro'))
    // console.log(projectFiles)

    const files = data.filter(file => file.type === 'file')
    const projectFiles = files.filter(file => file.path.endsWith('.kicad_sch') || file.path.endsWith('.kicad_pcb') || file.path.endsWith('.kicad_pro'))
    // const projectFilesPaths = projectFiles.map(file => file.path)
    // console.log(projectFilesPaths)

    return NextResponse.json({
      result: projectFiles
    }, {
      headers: {
        'Cache-Control': 'public, max-age=2592000, immutable'
      }
    })
  } catch (error) {
    console.error('Error fetching search results:', error)
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 })
  }
}
