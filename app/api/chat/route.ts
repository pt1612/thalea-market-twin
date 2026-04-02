import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import type { DigitalTwin, Message, ProjectInfo } from '@/lib/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const {
      projectInfo,
      twins,
      selectedTwinId,
      mode,
      messages,
      userMessage,
    }: {
      projectInfo: ProjectInfo
      twins: DigitalTwin[]
      selectedTwinId: string
      mode: 'problem' | 'value'
      messages: Message[]
      userMessage: string
    } = await request.json()

    const modeDescription =
      mode === 'problem'
        ? 'Problem Validation — focus on how intense the problem is, how often it occurs, current workarounds, and frustrations'
        : 'Value Proposition — focus on appeal of the solution, willingness to pay, adoption barriers, and desired features'

    let systemPrompt = ''

    if (selectedTwinId === 'all') {
      const twinDescriptions = twins
        .map(
          (t) =>
            `**${t.name}** (${t.age}, ${t.occupation})\nBackground: ${t.background}\nPain points: ${t.painPoints.join('; ')}\nMotivations: ${t.motivations.join('; ')}\nPersonality: ${t.personality}\nBudget: ${t.budget}\nTech savviness: ${t.techSavviness}`
        )
        .join('\n\n')

      const formatLines = twins
        .map((t) => `**${t.name}:** [their response in 2-3 sentences]`)
        .join('\n\n')

      systemPrompt = `You are facilitating a group interview with ${twins.length} digital twin customers evaluating a startup idea.

THE PRODUCT:
Name: ${projectInfo.name}
Problem: ${projectInfo.problem}
Solution: ${projectInfo.solution}
Target audience: ${projectInfo.target}

THE DIGITAL TWINS:
${twinDescriptions}

Interview mode: ${modeDescription}

Respond as all ${twins.length} twins in sequence. Each gives their own authentic, distinct perspective based on their unique background and personality. Format EXACTLY as:

${formatLines}

Be specific, realistic, and sometimes skeptical. Show genuine variety in perspectives — they should not all agree.`
    } else {
      const twin = twins.find((t) => t.id === selectedTwinId)
      if (!twin) throw new Error('Twin not found')

      systemPrompt = `You are ${twin.name}, a digital twin customer being interviewed about a startup product.

YOUR PROFILE:
Age: ${twin.age}
Occupation: ${twin.occupation}
Background: ${twin.background}
Pain points: ${twin.painPoints.join('; ')}
Motivations: ${twin.motivations.join('; ')}
Tech savviness: ${twin.techSavviness}
Budget: ${twin.budget}
Personality: ${twin.personality}

THE PRODUCT BEING EVALUATED:
Name: ${projectInfo.name}
Problem: ${projectInfo.problem}
Solution: ${projectInfo.solution}
Target audience: ${projectInfo.target}

Interview mode: ${modeDescription}

Respond authentically as ${twin.name}. Be specific, realistic, and true to your personality and background. Show genuine skepticism or enthusiasm where appropriate. Keep responses to 2-4 sentences.`
    }

    const groqMessages = [
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ]

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...groqMessages],
      temperature: 0.85,
      max_tokens: 800,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No content returned')

    return NextResponse.json({ response: content })
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
