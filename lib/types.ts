export interface ProjectInfo {
  name: string
  problem: string
  target: string
  solution: string
}

export interface DigitalTwin {
  id: string
  name: string
  age: number
  occupation: string
  background: string
  painPoints: string[]
  motivations: string[]
  techSavviness: 'low' | 'medium' | 'high'
  budget: string
  personality: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  twinId?: string
  twinName?: string
}

export interface Report {
  problemIntensity: number
  valueResonance: number
  recurringThemes: string[]
  mainObjections: string[]
  verdict: 'strong_fit' | 'weak_fit' | 'pivot_needed'
  nextSteps: string[]
  summary: string
}

export const TWIN_COLORS: Record<string, { bg: string; border: string; text: string; badge: string; dot: string }> = {
  twin1: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  twin2: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  twin3: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
    dot: 'bg-violet-500',
  },
}
