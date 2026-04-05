export interface ProjectInfo {
  name: string
  problem: string
  target: string
  solution: string
  twinCount: number
  marketSegments?: string   // comma-separated, optional
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
  budgetTier: 'low' | 'mid' | 'premium'
  affinityLabel: 'high_affinity' | 'moderate' | 'early_adopter'
  personality: string
  segment: string           // which market segment this twin represents
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  twinId?: string
  twinName?: string
  timestamp?: string
}

export interface WhereToPlayEntry {
  twinId: string
  twinName: string
  segment: string
  segmentAttractiveness: number   // 0-100
  abilityToServe: number          // 0-100
}

export interface Report {
  problemIntensity: number
  valueResonance: number
  recurringThemes: string[]
  mainObjections: string[]
  verdict: 'strong_fit' | 'weak_fit' | 'pivot_needed'
  nextSteps: string[]
  summary: string
  whereToPlay: WhereToPlayEntry[]
}

export const TWIN_SIDEBAR_COLORS = [
  'bg-forest text-white',
  'bg-teal-700 text-white',
  'bg-slate-700 text-white',
  'bg-amber-700 text-white',
  'bg-rose-700 text-white',
]

export function getTwinIndex(id: string): number {
  const match = id.match(/\d+/)
  return match ? parseInt(match[0]) - 1 : 0
}

export function getTechLabel(level: 'low' | 'medium' | 'high'): string {
  return { low: 'Novice', medium: 'Adept', high: 'Expert' }[level]
}

export function getTechProgress(level: 'low' | 'medium' | 'high'): number {
  return { low: 33, medium: 66, high: 100 }[level]
}

export function getAffinityDisplay(label: 'high_affinity' | 'moderate' | 'early_adopter'): {
  text: string
  className: string
} {
  const map = {
    high_affinity: {
      text: 'HIGH AFFINITY',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    moderate: {
      text: 'MODERATE',
      className: 'bg-slate-50 text-slate-600 border-slate-200',
    },
    early_adopter: {
      text: 'EARLY ADOPTER',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  }
  return map[label] ?? map.moderate
}

export function getBudgetDisplay(tier: 'low' | 'mid' | 'premium'): string {
  return { low: '€ BUDGET', mid: '€€ MID-TIER', premium: '€€€ PREMIUM' }[tier]
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatTime(date?: Date): string {
  const d = date || new Date()
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}
