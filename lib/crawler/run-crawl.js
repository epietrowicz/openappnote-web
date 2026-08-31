import { findKicadProjectDirs } from './find-projects'
import { buildProjectDocument, upsertDesignDocuments } from './upsert-designs'
import { getCrawlState, setCrawlState, repoCursorId } from './state'

const REPO_RECRAWL_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000

async function shouldSkipRepo (owner, repo) {
  const cursor = await getCrawlState(repoCursorId(owner, repo))
  if (!cursor) return false
  return Date.now() - new Date(cursor.lastCrawledAt).getTime() < REPO_RECRAWL_INTERVAL_MS
}

export async function crawlRepository (repository, deadline) {
  const owner = repository.owner.login
  const repo = repository.name

  if (await shouldSkipRepo(owner, repo)) return

  const projectDirs = await findKicadProjectDirs(owner, repo, repository.default_branch)
  const documents = []

  for (const projectDir of projectDirs) {
    if (Date.now() > deadline) break
    try {
      const doc = await buildProjectDocument(repository, projectDir)
      if (doc) documents.push(doc)
    } catch (error) {
      console.error(`Failed to index ${owner}/${repo}/${projectDir}:`, error.status ?? error)
    }
  }

  await upsertDesignDocuments(documents)
  await setCrawlState({
    id: repoCursorId(owner, repo),
    kind: 'repo-cursor',
    owner,
    repo,
    lastCrawledAt: new Date().toISOString()
  })
}
