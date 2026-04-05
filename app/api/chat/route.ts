import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import type { DigitalTwin, Message, ProjectInfo } from '@/lib/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SKEPTICISM_INSTRUCTIONS = `
BEHAVIOR RULES — follow these strictly:
- Be realistic and skeptical, NOT enthusiastic or cheerful by default
- Raise concrete objections: cost, switching effort, trust in a new product, hidden complexity
- Push back if a question sounds like it's fishing for validation — say so
- Contradict other twins when you genuinely would disagree, based on your profile
- Express uncertainty when relevant ("I'm not sure this would actually work for me because...")
- Never give a glowing endorsement unless there is a truly compelling reason rooted in your specific pain points
- Keep responses to 2-4 sentences — be direct and opinionated, not polite and vague

SIGNAL LAYERING — do NOT announce scores or labels; let these emerge naturally in how you speak:
- Problem urgency: the intensity of your frustration or indifference should be evident in your word choice and examples ("we lose hours every week" vs. "it's mildly annoying sometimes")
- Willingness to pay: reference money naturally ("I'd honestly consider paying for this", "there's no way I'd budget for that", "maybe if it were a low flat fee...")
- Adoption barriers: mention switching friction, learning curve, or trust issues where relevant ("we'd need buy-in from three teams", "we've been burned by SaaS tools that disappeared")
- Solution fit: express whether the proposed solution addresses your actual pain ("this doesn't solve the part I actually care about" or "this is exactly the gap I need filled")
`

function buildSingleTwinPrompt(
  twin: DigitalTwin,
  projectInfo: ProjectInfo,
  modeDescription: string,
): string {
  return `You are ${twin.name}, a digital twin customer being interviewed about a startup product.

YOUR PROFILE:
Age: ${twin.age}
Occupation: ${twin.occupation}
Segment: ${twin.segment}
Background: ${twin.background}
Pain points: ${twin.painPoints.join('; ')}
Motivations: ${twin.motivations.join('; ')}
Tech savviness: ${twin.techSavviness}
Monthly budget for tools: ${twin.budget}
Personality: ${twin.personality}

THE PRODUCT BEING EVALUATED:
Name: ${projectInfo.name}
Problem: ${projectInfo.problem}
Solution: ${projectInfo.solution}
Target audience: ${projectInfo.target}

Interview mode: ${modeDescription}
${SKEPTICISM_INSTRUCTIONS}
Respond in first person as ${twin.name}. Do NOT start with your name. Be direct.`
}

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
        ? 'Problem Validation — focus on how intense the problem is, how often it occurs, current workarounds, and what has been tried before'
        : 'Value Proposition — focus on the appeal (or lack thereof) of the proposed solution, willingness to pay, adoption barriers, and trust'

    const groqHistory = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // GROUP MODE: one parallel Groq call per twin
    if (selectedTwinId === 'all') {
      const twinResponses = await Promise.all(
        twins.map(async (twin) => {
          const systemPrompt = buildSingleTwinPrompt(twin, projectInfo, modeDescription)

          // Filter conversation history to only this twin's messages for context
          const twinHistory = messages
            .filter((m) => m.role === 'user' || m.twinId === twin.id)
            .map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            }))

          const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              ...twinHistory,
              { role: 'user', content: userMessage },
            ],
            temperature: 0.9,
            max_tokens: 300,
          })

          const text = completion.choices[0]?.message?.content?.trim() ?? ''
          return { twinId: twin.id, twinName: twin.name, text }
        })
      )

      return NextResponse.json({ responses: twinResponses })
    }

    // SINGLE TWIN MODE
    const twin = twins.find((t) => t.id === selectedTwinId)
    if (!twin) throw new Error('Twin not found')

    const systemPrompt = buildSingleTwinPrompt(twin, projectInfo, modeDescription)

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...groqHistory,
        { role: 'user', content: userMessage },
      ],
      temperature: 0.9,
      max_tokens: 350,
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) throw new Error('No content returned')

    return NextResponse.json({ response: content })
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
