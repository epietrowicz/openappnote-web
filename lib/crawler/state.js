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
  // Default waitForTask timeout is 5000ms - too short once the index has real
  // volume in it and indexing genuinely takes longer than that to finish.
  await index.waitForTask(task.taskUid, { timeOutMs: 60_000 })
}
