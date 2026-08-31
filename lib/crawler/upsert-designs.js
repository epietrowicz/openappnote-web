import crypto from 'node:crypto'
import { getProjectFiles } from '@/lib/github-tree'
import { getKicadProjectName, isRefToInclude, sortParts } from '@/lib/util'
import { CURATED_TAGS } from '@/lib/tags'
import { getDesignsIndex } from '@/lib/meilisearch-schema'
import { generateBom } from './generate-bom'

function projectDocumentId (owner, repo, projectPath) {
  return crypto.createHash('sha1').update(`${owner}/${repo}/${projectPath}`.toLowerCase()).digest('hex')
}

function matchTags (repository) {
  const haystack = [
    repository.name,
    repository.description ?? '',
    ...(repository.topics ?? [])
  ].join(' ').toLowerCase()

  return CURATED_TAGS.filter(tag => haystack.includes(tag))
}

function rawFileUrl (repository, file) {
  return `https://raw.githubusercontent.com/${repository.full_name}/${repository.default_branch}/${file.path}`
}

// One document per .kicad_pro project (a repo can have several, a project can span
// several .kicad_sch sheets) - returns null when the project can't be confidently
// resolved, matching how the design detail page treats an ambiguous root as unrenderable.
export async function buildProjectDocument (repository, projectDir) {
  const owner = repository.owner.login
  const repo = repository.name

  const projectFiles = await getProjectFiles(owner, repo, projectDir, repository.default_branch)
  const projectName = getKicadProjectName(projectFiles)
  if (!projectName) return null

  const schematicFiles = projectFiles.filter(file => file.path.endsWith('.kicad_sch'))
  const pcbFiles = projectFiles.filter(file => file.path.endsWith('.kicad_pcb'))

  const rootSchFile = schematicFiles.find(file => file.path.endsWith(`${projectName}.kicad_sch`))
  if (!rootSchFile) return null

  const schematicUrls = schematicFiles.map(file => rawFileUrl(repository, file))
  const rawParts = await generateBom(rawFileUrl(repository, rootSchFile), schematicUrls)

  const parts = sortParts(rawParts.filter(part => isRefToInclude(part.Reference)))
    .map(part => ({
      partNumber: part.Value,
      referenceDesignator: part.Reference,
      description: part.Description
    }))

  const now = new Date().toISOString()

  return {
    id: projectDocumentId(owner, repo, projectDir),
    projectName,
    projectPath: projectDir,
    rootSchPath: rootSchFile.path,
    schematicPaths: schematicFiles.map(file => file.path),
    pcbPaths: pcbFiles.map(file => file.path),
    repository: {
      name: repository.name,
      description: repository.description,
      default_branch: repository.default_branch,
      stargazers_count: repository.stargazers_count,
      owner: {
        login: repository.owner.login,
        avatar_url: repository.owner.avatar_url
      }
    },
    tags: matchTags(repository),
    parts,
    partNumbers: [...new Set(parts.map(part => part.partNumber).filter(Boolean))],
    partDescriptions: [...new Set(parts.map(part => part.description).filter(Boolean))],
    // Reset on every crawl for simplicity - not fetched-and-preserved from the
    // previous document, so this tracks "last (re)discovered" rather than first-ever.
    discoveredAt: now,
    lastCrawledAt: now
  }
}

export async function upsertDesignDocuments (documents) {
  if (documents.length === 0) return
  const index = getDesignsIndex()
  const task = await index.addDocuments(documents, { primaryKey: 'id' })
  await index.waitForTask(task.taskUid)
}
