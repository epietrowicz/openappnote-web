import crypto from 'node:crypto'
import { getCrawlStateIndex } from '@/lib/meilisearch-schema'

export function repoCursorId (owner, repo) {
  return `repo-${crypto.createHash('sha1').update(`${owner}/${repo}`.toLowerCase()).digest('hex')}`
}

export async function getCrawlState (id, client) {
  try {
    return await getCrawlStateIndex(client).getDocument(id)
  } catch {
    return null
  }
}

export async function setCrawlState (doc, client) {
  const index = getCrawlStateIndex(client)
  const task = await index.addDocuments([{ ...doc, updatedAt: new Date().toISOString() }], { primaryKey: 'id' })
  await index.waitForTask(task.taskUid)
}
