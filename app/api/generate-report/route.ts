import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import type { ProjectInfo, Message, DigitalTwin } from '@/lib/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const {
      projectInfo,
      twins,
      messages,
    }: {
      projectInfo: ProjectInfo
      twins: DigitalTwin[]
      messages: Message[]
    } = await request.json()

    const transcript = messages
      .map((m) =>
        m.role === 'user'
          ? `Interviewer: ${m.content}`
          : `${m.twinName || 'Twin'}: ${m.content}`
      )
      .join('\n\n')

    const twinSummary = twins
      .map((t) => `- ${t.name} | Segment: "${t.segment}" | ${t.age}, ${t.occupation}`)
      .join('\n')

    const prompt = `Analyze this startup validation interview and generate a comprehensive validation report.

PROJECT DETAILS:
Name: ${projectInfo.name}
Problem: ${projectInfo.problem}
Target audience: ${projectInfo.target}
Solution: ${projectInfo.solution}

DIGITAL TWINS INTERVIEWED:
${twinSummary}

INTERVIEW TRANSCRIPT:
${transcript || 'No conversation recorded.'}

Generate a validation report as a JSON object with exactly these fields:
- problemIntensity: number 0-100 (how intense and real the problem is based on responses; 0=not a real problem, 100=extremely painful)
- valueResonance: number 0-100 (how well the solution resonates; 0=no interest, 100=strong demand)
- recurringThemes: string[] (3-5 key themes that came up repeatedly in the conversation)
- mainObjections: string[] (3-4 main objections or concerns raised by the twins)
- verdict: exactly one of "strong_fit" | "weak_fit" | "pivot_needed"
- nextSteps: string[] (exactly 3 specific, actionable next steps for the founder)
- summary: string (2-3 sentences summarizing the key validation findings)
- whereToPlay: array with one entry per twin, each entry being:
  {
    "twinId": string (e.g. "twin1"),
    "twinName": string,
    "segment": string (the twin's segment label),
    "segmentAttractiveness": number 0-100 (how attractive this segment is as a market opportunity — based on problem urgency and willingness-to-pay signals expressed in the interview; 0 = very low urgency/WTP, 100 = extremely urgent with high WTP),
    "abilityToServe": number 0-100 (how well the proposed solution fits this segment's specific needs — based on perceived solution fit and absence of hard adoption barriers from the interview; 0 = very poor fit or blocking barriers, 100 = strong fit, easy adoption)
  }
  The whereToPlay scores MUST be derived strictly from interview signals (language about urgency, budget references, adoption friction, fit expressed by each twin). Do not make all scores similar — spread them across the 0-100 range based on actual differences in how each twin responded.

Be rigorous and honest in your assessment. Base scores on actual interview content, not just the project description.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No content returned')

    const report = JSON.parse(content)
    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
