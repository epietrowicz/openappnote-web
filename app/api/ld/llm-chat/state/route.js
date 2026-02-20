import { NextResponse } from 'next/server'

const LD_API_BASE = 'https://app.launchdarkly.com/api/v2'

export async function POST (req) {
  const token = process.env.LAUNCHDARKLY_ACCESS_TOKEN
  const projectKey = process.env.LAUNCHDARKLY_PROJECT_KEY
  const environmentKey = process.env.NODE_ENV === 'development' ? 'test' : 'production'

  if (!token || !projectKey) {
    return NextResponse.json(
      { error: 'Missing LAUNCHDARKLY_ACCESS_TOKEN, LAUNCHDARKLY_PROJECT_KEY' },
      { status: 501 }
    )
  }

  const { on } = await req.json()

  const url = `${LD_API_BASE}/flags/${projectKey}/llm-chat`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json; domain-model=launchdarkly.semanticpatch',
        Authorization: token
      },
      body: JSON.stringify({
        environmentKey,
        instructions: [{ kind: on ? 'turnFlagOn' : 'turnFlagOff' }]
      })
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('LaunchDarkly API error:', res.status, err)
      return NextResponse.json(
        { error: 'Failed to disable flag', detail: err },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json({ ok: true, flag: 'llm-chat', state: 'off', data })
  } catch (error) {
    console.error('LD disable route error:', error)
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
