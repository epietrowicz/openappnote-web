import { NextResponse } from 'next/server'
import { createAgent, HumanMessage } from 'langchain'
import { ChatAnthropic } from '@langchain/anthropic'
import { countSimilarDesigns, getBillOfMaterials, getDigiKeyPricing, searchDigiKey } from '@/lib/tools'

export async function POST (req) {
  try {
    const { query, pdfUrl, model, designPath } = await req.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required and must be a string' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Chat API not configured' }, { status: 500 })
    }

    const message = new HumanMessage({
      content: [
        { type: 'text', text: query },
        { type: 'file', source_type: 'url', url: pdfUrl, mime_type: 'application/pdf' }
      ]
    })

    const llm = new ChatAnthropic({
      model,
      apiKey
    })

    const agent = createAgent({
      model: llm,
      systemPrompt: `You are a helpful assistant that can help with questions about the given electronics design with the given path: ${designPath}.`,
      tools: [countSimilarDesigns, getBillOfMaterials, getDigiKeyPricing, searchDigiKey],
      message
    })
    const response = await agent.invoke({ messages: [message] })
    const aiMessage = response.messages[response.messages.length - 1].content
    console.log(response)
    return NextResponse.json({ text: aiMessage })
  } catch (error) {
    console.error('Chat route error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
