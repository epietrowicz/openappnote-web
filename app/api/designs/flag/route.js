import { NextResponse } from 'next/server'
import { submitDesignFlag, FLAG_REASONS } from '@/lib/design-flags'

export async function POST (request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { owner, repo, projectPath, reason } = body ?? {}

  if (typeof owner !== 'string' || !owner || typeof repo !== 'string' || !repo || typeof projectPath !== 'string') {
    return NextResponse.json({ error: 'owner, repo, and projectPath are required' }, { status: 400 })
  }
  if (!FLAG_REASONS.includes(reason)) {
    return NextResponse.json({ error: `reason must be one of: ${FLAG_REASONS.join(', ')}` }, { status: 400 })
  }

  try {
    await submitDesignFlag({ owner, repo, projectPath, reason })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to record design flag:', error)
    return NextResponse.json({ error: 'Failed to record flag' }, { status: 500 })
  }
}
