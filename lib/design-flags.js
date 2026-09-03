import crypto from 'node:crypto'
import { getDesignFlagsIndex } from './meilisearch-schema'

export const FLAG_REASONS = ['broken', 'failed']

// Recorded for manual review only for now - not deduped (no user accounts to key
// off of) and not yet folded into search ranking alongside hasPcb/partCount.
export async function submitDesignFlag ({ owner, repo, projectPath, reason }, client) {
  if (!owner || !repo || typeof projectPath !== 'string') {
    throw new Error('owner, repo, and projectPath are required')
  }
  if (!FLAG_REASONS.includes(reason)) {
    throw new Error(`reason must be one of: ${FLAG_REASONS.join(', ')}`)
  }

  const index = getDesignFlagsIndex(client)
  const doc = {
    id: crypto.randomUUID(),
    owner,
    repo,
    projectPath,
    reason,
    createdAt: new Date().toISOString()
  }

  const task = await index.addDocuments([doc], { primaryKey: 'id' })
  await index.waitForTask(task.taskUid, { timeOutMs: 10_000 })
  return doc
}
