import { octokit } from './gh'

export async function getProjectFiles (owner, repo, path, ref) {
  const depth = path.split('/').length - 1
  const isNestedFile = depth > 1
  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: ref,
    recursive: isNestedFile
  })

  const filteredFiles = data.tree.filter(file => {
    if (file.type !== 'blob') return false
    if (!file.path.startsWith(path)) return false

    const remainingPath = file.path.slice(path.length)
    const relativePath = remainingPath.startsWith('/') ? remainingPath.slice(1) : remainingPath
    if (relativePath.includes('/')) return false
    return true
  })

  return filteredFiles.filter(file =>
    file.path.endsWith('.kicad_sch') ||
    file.path.endsWith('.kicad_pcb') ||
    file.path.endsWith('.kicad_pro')
  )
}
