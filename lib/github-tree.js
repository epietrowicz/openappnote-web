import { octokit } from './gh'

// Directories that themselves contain a .kicad_pro - a nested project's own
// boundary. A file under one of these belongs to that project, not `path`,
// even if it's also a descendant of `path` (e.g. a subproject folder).
function findProjectDirBoundaries (tree) {
  return new Set(
    tree
      .filter(file => file.type === 'blob' && file.path.endsWith('.kicad_pro'))
      .map(file => file.path.split('/').slice(0, -1).join('/'))
  )
}

// Pure filter over an already-fetched recursive tree - no network call, so
// callers that already have the tree (e.g. the crawler, which fetches it once
// per repo via findKicadProjectDirs) can reuse it instead of re-fetching.
export function filterProjectFiles (tree, path) {
  const projectDirs = findProjectDirBoundaries(tree)

  const filteredFiles = tree.filter(file => {
    if (file.type !== 'blob') return false
    if (path !== '' && file.path !== path && !file.path.startsWith(`${path}/`)) return false

    // Files can live in a subdirectory of `path` (e.g. hierarchical sub-sheets
    // in a `sheets/` folder) rather than only directly alongside the .kicad_pro.
    const relativePath = path === '' ? file.path : file.path.slice(path.length + 1)
    const segments = relativePath.split('/')
    segments.pop() // drop the filename, keep only intermediate directory segments

    let currentDir = path
    for (const segment of segments) {
      currentDir = currentDir === '' ? segment : `${currentDir}/${segment}`
      if (currentDir !== path && projectDirs.has(currentDir)) return false
    }
    return true
  })

  return filteredFiles.filter(file =>
    file.path.endsWith('.kicad_sch') ||
    file.path.endsWith('.kicad_pcb') ||
    file.path.endsWith('.kicad_pro')
  )
}

export async function getProjectFiles (owner, repo, path, ref) {
  // A non-recursive tree call only returns entries directly under the repo root,
  // regardless of how many segments `path` has - any non-root path needs recursive:true
  // to reach it in one call.
  const isNestedFile = path !== ''
  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: ref,
    recursive: isNestedFile
  })

  return filterProjectFiles(data.tree, path)
}
