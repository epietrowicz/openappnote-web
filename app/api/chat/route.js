import { ChatAnthropic } from '@langchain/anthropic'
import { NextResponse } from 'next/server'
import { getLdAiClient } from '@/lib/launchdarkly'
import { createAgent, HumanMessage, SystemMessage, AIMessage } from 'langchain'
import { countSimilarDesigns, getBillOfMaterials, getDigiKeyPricing, searchDigiKey } from '@/lib/tools'

function ldMessagesToLangChain (ldMessages) {
  return ldMessages.map((m) => {
    switch (m.role) {
      case 'system':
        return new SystemMessage(m.content)
      case 'assistant':
        return new AIMessage(m.content)
      case 'user':
      default:
        return new HumanMessage(m.content)
    }
  })
}

export async function POST (req) {
  const { query, pdfUrl, userId, tier, yearsOfExperience } = await req.json()
  const { aiClient } = await getLdAiClient()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Chat API not configured' }, { status: 500 })
  }

  const userPdfMessage = new HumanMessage({
    content: [
      { type: 'text', text: query },
      { type: 'file', source_type: 'url', url: pdfUrl, mime_type: 'application/pdf' }
    ]
  })

  const ldContext = {
    kind: 'user',
    key: userId,
    tier,
    years_of_experience: yearsOfExperience
  }

  const fallbackConfig = {
    enabled: false
  }

  const aiConfig = await aiClient.completionConfig(
    'design-summarizer',
    ldContext,
    fallbackConfig,
    {
      query
    }
  )

  if (!aiConfig.enabled) {
    return NextResponse.json({ error: 'AI is disabled' }, { status: 503 })
  }

  const resolvedModel = aiConfig.model.name

  const llm = new ChatAnthropic({
    model: resolvedModel,
    apiKey
  })

  const configMessages = ldMessagesToLangChain(aiConfig.messages)

  const systemPrompt = aiConfig.messages.find((m) => m.role === 'system')?.content

  if (!systemPrompt) {
    return NextResponse.json({ error: 'System prompt not found' }, { status: 500 })
  }

  const agent = createAgent({
    model: llm,
    systemPrompt,
    tools: [countSimilarDesigns, getBillOfMaterials, getDigiKeyPricing, searchDigiKey]
  })

  const response = await agent.invoke({
    messages: [
      ...configMessages.filter((m) => m._getType?.() !== 'system'),
      userPdfMessage
    ]
  })
  const aiMessage = response.messages[response.messages.length - 1]?.content
  return NextResponse.json({ text: aiMessage })
}
