import { octokit } from '@/lib/gh'

// One recursive tree call finds every .kicad_pro in the repo (core API budget),
// instead of spending scarce code-search budget per file. Returns the raw tree
// alongside the discovered project dirs so callers processing multiple projects
// in the same repo (buildProjectDocument, via filterProjectFiles) can reuse it
// instead of each independently re-fetching and re-filtering the whole tree.
// Note: GitHub truncates very large trees (`data.truncated`) - deeply nested
// monorepos may miss projects past the truncation point.
export async function findKicadProjectDirs (owner, repo, ref) {
  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: ref,
    recursive: true
  })

  const projectDirs = data.tree
    .filter(file => file.type === 'blob' && file.path.endsWith('.kicad_pro'))
    .map(file => {
      const segments = file.path.split('/')
      segments.pop()
      return segments.join('/')
    })

  return { projectDirs, tree: data.tree }
}
