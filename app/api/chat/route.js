import { NextResponse } from 'next/server'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

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
