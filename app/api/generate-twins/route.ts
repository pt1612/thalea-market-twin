import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { projectInfo } = await request.json()

    const prompt = `You are creating 3 realistic digital twin customer profiles for startup validation.

Project Name: ${projectInfo.name}
Problem being solved: ${projectInfo.problem}
Target audience: ${projectInfo.target}
Proposed solution: ${projectInfo.solution}

Generate 3 diverse but relevant digital twin profiles representing realistic potential customers from this target audience. Make them diverse in age, occupation, and background while remaining true to the target audience described.

Return a JSON object with a "twins" array containing exactly 3 profiles. Each profile must have:
- id: "twin1", "twin2", or "twin3"
- name: string (realistic full name)
- age: number
- occupation: string
- background: string (2-3 sentences describing their background, daily life, and how the problem affects them)
- painPoints: string[] (exactly 3 specific pain points related to the problem)
- motivations: string[] (exactly 3 key motivations)
- techSavviness: "low" or "medium" or "high"
- budget: string (monthly budget range they would allocate for a solution, e.g. "$30-50/month")
- personality: string (one concise sentence describing their personality and decision-making style)`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No content returned')

    const data = JSON.parse(content)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating twins:', error)
    return NextResponse.json({ error: 'Failed to generate twins' }, { status: 500 })
  }
}
