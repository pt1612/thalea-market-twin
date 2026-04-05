import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { projectInfo } = await request.json()

    // count is always driven by twinCount from the form
    const count = Math.min(Math.max(parseInt(String(projectInfo.twinCount)) || 3, 1), 5)

    // Parse segments; if provided, cycle them to fill count (e.g. 3 segments + count 5 → seg1,seg2,seg3,seg1,seg2)
    const rawSegments: string = projectInfo.marketSegments ?? ''
    const baseSegments: string[] = rawSegments
      ? rawSegments.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
    const segmentMode = baseSegments.length > 0
    // Build the per-twin segment assignment by cycling through baseSegments
    const assignedSegments: string[] = segmentMode
      ? Array.from({ length: count }, (_, i) => baseSegments[i % baseSegments.length])
      : []

    console.log('[generate-twins] twinCount from form:', projectInfo.twinCount, '| count:', count)
    console.log('[generate-twins] marketSegments raw:', JSON.stringify(rawSegments))
    console.log('[generate-twins] baseSegments:', baseSegments, '| segmentMode:', segmentMode)
    console.log('[generate-twins] assignedSegments:', assignedSegments)

    const ids = Array.from({ length: count }, (_, i) => `twin${i + 1}`)

    const segmentInstructions = segmentMode
      ? `The user has identified market segments. Generate exactly ${count} Twins, assigning each one the segment listed below. Segments cycle if twinCount exceeds the number of segments — Twins sharing a segment must still have DISTINCT personas, different seniority, company size, and behavioural style.

Twin segment assignments:
${assignedSegments.map((s, i) => `- twin${i + 1}: segment "${s}"`).join('\n')}

Each Twin's "segment" field must be set to the exact segment name assigned above.`
      : `Generate ${count} HIGHLY DIVERSE customer profiles from the target audience. They must differ significantly in:
- role type and company size (e.g. solo founder vs. ops manager at a 200-person firm)
- digital maturity (some tech-forward, others still using spreadsheets)
- urgency of the problem (some barely affected, others severely frustrated)
- openness to switching from their current solution
Set the "segment" field to a short descriptive label for the archetype each Twin represents (e.g. "Budget-Conscious SME", "Enterprise Power User", "Tech-Forward Startup").`

    const prompt = `You are creating ${count} realistic digital twin customer profiles for startup validation.

Project Name: ${projectInfo.name}
Problem being solved: ${projectInfo.problem}
Target audience: ${projectInfo.target}
Proposed solution: ${projectInfo.solution}

${segmentInstructions}

Return a JSON object with a "twins" array containing exactly ${count} profiles. The IDs must be: ${ids.join(', ')}.

Each profile must have these fields:

- id: one of ${ids.map((id: string) => `"${id}"`).join(', ')}
- segment: string (the market segment this Twin represents — see instructions above)
- name: string (realistic full name matching the cultural context of the target audience)
- age: number (vary ages meaningfully across the ${count} profiles)
- occupation: string (concise job title, 2-4 words — vary seniority and role type)
- background: string (EXACTLY 4 sentences: 1) professional background and current role, 2) daily routine and how this problem appears in their workday, 3) their relationship with technology and past experiences with similar tools, 4) a specific behavioral pattern or quirk that shapes how they evaluate new products)
- painPoints: string[] (exactly 3 sharp, specific pain points about the problem — each under 12 words, avoid generic filler)
- motivations: string[] (exactly 3 motivations — make them specific to their profile, not generic)
- techSavviness: "low" or "medium" or "high" (MUST vary across profiles — do not assign all the same level)
- budget: string (the actual dollar or euro monthly range they would realistically pay, e.g. "$15-25/month" or "$200+/month" — base this on their occupation and income level)
- budgetTier: MUST be exactly one of "low", "mid", or "premium" — assign based on the budget range. If the monthly budget is under $40, use "low". Between $40-$120 use "mid". Over $120 use "premium". IMPORTANT: do NOT assign the same tier to all profiles — make them genuinely different.
- affinityLabel: MUST be exactly one of "high_affinity", "moderate", or "early_adopter" — assign based on their openness to new solutions. "early_adopter" = excited to try new things first. "high_affinity" = strong fit who will commit once convinced. "moderate" = cautious, needs evidence. IMPORTANT: do NOT assign the same label to all profiles — vary them meaningfully.
- personality: string (ONE sentence describing their core decision-making style and personality — e.g. "A data-driven pragmatist who demands proof before committing, and openly pushes back on any claim that sounds like marketing speak.")

CRITICAL RULES:
- budgetTier values across all ${count} profiles MUST NOT all be the same
- affinityLabel values across all ${count} profiles MUST NOT all be the same
- techSavviness values across all ${count} profiles MUST NOT all be the same
- Make the profiles genuinely contrasting, not slight variations of the same archetype`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.9,
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
