import { NextResponse } from 'next/server'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_USAGE_URL = 'https://api.anthropic.com/v1/organizations/usage_report/messages'

/**
 * GET /api/chat/usage
 * Returns usage (token counts) for your Anthropic org.
 * Requires ANTHROPIC_ADMIN_API_KEY (sk-ant-admin...); not available for individual accounts.
 * Query: starting_at, ending_at (ISO dates), bucket_width (1m|1h|1d). Defaults: last 7 days, 1d buckets.
 */
export async function GET (req) {
  // const adminKey = process.env.ANTHROPIC_ADMIN_API_KEY
  // if (!adminKey || !adminKey.startsWith('sk-ant-admin')) {
  //   return NextResponse.json(
  //     { error: 'Usage API requires ANTHROPIC_ADMIN_API_KEY (Admin API key) and an organization account.' },
  //     { status: 501 }
  //   )
  // }

  const adminKey = process.env.ANTHROPIC_API_KEY

  const { searchParams } = new URL(req.url)
  const now = new Date()
  const ending = searchParams.get('ending_at') ?? now.toISOString()
  const start = searchParams.get('starting_at') ?? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const bucketWidth = searchParams.get('bucket_width') ?? '1d'

  try {
    const url = new URL(ANTHROPIC_USAGE_URL)
    url.searchParams.set('starting_at', start)
    url.searchParams.set('ending_at', ending)
    url.searchParams.set('bucket_width', bucketWidth)

    const res = await fetch(url.toString(), {
      headers: {
        'anthropic-version': '2023-06-01',
        'x-api-key': adminKey
      }
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Anthropic Usage API error:', res.status, err)
      return NextResponse.json(
        { error: 'Failed to fetch usage', detail: err },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Usage route error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function POST (req) {
  try {
    const { query, pdfUrl } = await req.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required and must be a string' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Chat API not configured' }, { status: 500 })
    }

    let userContent

    if (pdfUrl && typeof pdfUrl === 'string') {
      const pdfRes = await fetch(pdfUrl)
      if (!pdfRes.ok) {
        console.error('Failed to fetch PDF:', pdfRes.status, pdfUrl)
        return NextResponse.json({ error: 'Failed to load schematic PDF' }, { status: 400 })
      }
      const pdfBuffer = await pdfRes.arrayBuffer()
      const base64Pdf = Buffer.from(pdfBuffer).toString('base64')

      userContent = [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64Pdf
          }
        },
        {
          type: 'text',
          text: `The attached document is this design's schematic PDF. Use it as context.\n\nUser question: ${query}`
        }
      ]
    } else {
      userContent = query
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: userContent }]
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', response.status, err)
      return NextResponse.json(
        { error: 'Failed to get response from Claude' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const text = data.content
      ?.filter(block => block.type === 'text')
      ?.map(block => block.text)
      ?.join('') ?? ''

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Chat route error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
