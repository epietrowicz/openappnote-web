import crypto from 'node:crypto'
import { getCrawlStateIndex } from '@/lib/meilisearch-schema'

export function repoCursorId (owner, repo) {
  return `repo-${crypto.createHash('sha1').update(`${owner}/${repo}`.toLowerCase()).digest('hex')}`
}

export async function getCrawlState (id) {
  try {
    return await getCrawlStateIndex().getDocument(id)
  } catch {
    return null
  }
}

export async function setCrawlState (doc) {
  const index = getCrawlStateIndex()
  const task = await index.addDocuments([{ ...doc, updatedAt: new Date().toISOString() }], { primaryKey: 'id' })
  await index.waitForTask(task.taskUid)
}
